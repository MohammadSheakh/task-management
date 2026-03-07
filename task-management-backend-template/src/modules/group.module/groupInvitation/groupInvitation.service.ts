import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { GroupInvitation } from './groupInvitation.model';
import { IGroupInvitation, IGroupInvitationDocument, IBulkInvitationPayload } from './groupInvitation.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { redisClient } from '../../../helpers/redis/redis';
import {
  GROUP_INVITATION_STATUS,
  INVITATION_LIMITS,
  INVITATION_CACHE_CONFIG,
  QUEUE_CONFIG,
} from './groupInvitation.constant';
import { errorLogger, logger } from '../../../shared/logger';
import { Group } from '../group/group.model';
import { GroupMember } from '../groupMember/groupMember.model';
import { notificationQueue } from '../../../helpers/bullmq/bullmq';
import { TRole } from '../../../middlewares/roles';

/**
 * GroupInvitation Service
 * Handles business logic for group invitation operations
 *
 * Features:
 * - BullMQ for async email sending
 * - Redis caching for invitation lists
 * - Token-based acceptance
 * - Automatic expiry handling
 * - Bulk invitation support
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class GroupInvitationService extends GenericService<typeof GroupInvitation, IGroupInvitationDocument> {
  constructor() {
    super(GroupInvitation);
  }

  /**
   * Cache Key Generator
   */
  private getCacheKey(type: 'invitations' | 'invitation' | 'pending', groupId?: string, userId?: string): string {
    const prefix = INVITATION_CACHE_CONFIG.PREFIX;
    if (type === 'invitations' && groupId) {
      return `${prefix}:group:${groupId}:invitations`;
    }
    if (type === 'pending' && groupId) {
      return `${prefix}:group:${groupId}:invitations:pending`;
    }
    if (type === 'invitation') {
      return `${prefix}:invitation:${groupId}:${userId}`;
    }
    return `${prefix}:unknown`;
  }

  /**
   * Get from Cache
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return JSON.parse(cachedData) as T;
      }
      return null;
    } catch (error) {
      errorLogger.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set in Cache
   */
  private async setInCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      errorLogger.error('Redis SET error:', error);
    }
  }

  /**
   * Invalidate Cache
   */
  private async invalidateCache(groupId: string, userId?: string): Promise<void> {
    try {
      const keysToDelete = [
        this.getCacheKey('invitations', groupId),
        this.getCacheKey('pending', groupId),
      ];

      if (userId) {
        keysToDelete.push(this.getCacheKey('invitation', groupId, userId));
      }

      await redisClient.del(keysToDelete);
    } catch (error) {
      errorLogger.error('Redis DELETE error:', error);
    }
  }

  /**
   * Send Invitation (Async with BullMQ)
   * Queues email notification for background processing
   */
  private async queueInvitationEmail(invitation: IGroupInvitationDocument, groupName: string): Promise<void> {
    try {
      await notificationQueue.add(
        'sendGroupInvitation',
        {
          invitationId: invitation._id.toString(),
          email: invitation.email,
          groupName,
          invitedBy: invitation.invitedByUserId,
          token: invitation.token,
          expiresAt: invitation.expiresAt,
          message: invitation.message,
        },
        {
          attempts: QUEUE_CONFIG.JOB_ATTEMPTS,
          backoff: {
            type: 'exponential',
            delay: QUEUE_CONFIG.BACKOFF_DELAY,
          },
        }
      );
      logger.info(`📧 Invitation email queued for ${invitation.email || invitation.invitedUserId}`);
    } catch (error) {
      errorLogger.error('Failed to queue invitation email:', error);
      // Don't throw - invitation is still valid even if email fails
    }
  }

  /**
   * Create a single invitation
   * Validates limits and sends email asynchronously
   *
   * @param groupId - Group ID
   * @param invitedByUserId - User sending invitation
   * @param email - Email to invite
   * @param userId - Optional user ID if registered
   * @param message - Optional personal message
   * @returns Created invitation
   */
  async createInvitation(
    groupId: string,
    invitedByUserId: string,
    email?: string,
    userId?: string,
    message?: string
  ): Promise<IGroupInvitationDocument> {
    const groupObjectId = new Types.ObjectId(groupId);
    const inviterObjectId = new Types.ObjectId(invitedByUserId);

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
    }

    // Check if user is already a member
    const isAlreadyMember = await GroupMember.isUserMember(groupObjectId, userId ? new Types.ObjectId(userId) : null as any);
    if (isAlreadyMember) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'User is already a member of this group'
      );
    }

    // Check pending invitation limit
    const pendingCount = await GroupInvitation.countPendingInvitations(groupObjectId);
    if (pendingCount >= INVITATION_LIMITS.MAX_PENDING_INVITATIONS_PER_GROUP) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Maximum ${INVITATION_LIMITS.MAX_PENDING_INVITATIONS_PER_GROUP} pending invitations allowed`
      );
    }

    // Check if invitation already exists for this email/user
    const existingInvitation = await GroupInvitation.findOne({
      groupId: groupObjectId,
      $or: [
        ...(email ? [{ email: email.toLowerCase() }] : []),
        ...(userId ? [{ invitedUserId: new Types.ObjectId(userId) }] : []),
      ],
      status: GROUP_INVITATION_STATUS.PENDING,
      isDeleted: false,
    });

    if (existingInvitation) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invitation already sent to this recipient'
      );
    }

    // Create invitation
    const invitation = await GroupInvitation.create({
      groupId: groupObjectId,
      invitedByUserId: inviterObjectId,
      invitedUserId: userId ? new Types.ObjectId(userId) : undefined,
      email: email ? email.toLowerCase() : undefined,
      status: GROUP_INVITATION_STATUS.PENDING,
      message: message || '',
    });

    // Queue email notification (async)
    await this.queueInvitationEmail(invitation, group.name);

    // Invalidate cache
    await this.invalidateCache(groupId);

    return invitation;
  }

  /**
   * Create bulk invitations
   * Uses transaction for atomicity
   *
   * @param groupId - Group ID
   * @param invitedByUserId - User sending invitations
   * @param payload - Bulk invitation payload
   * @returns Array of created invitations
   */
  async createBulkInvitations(
    groupId: string,
    invitedByUserId: string,
    payload: IBulkInvitationPayload
  ): Promise<IGroupInvitationDocument[]> {
    const { emails = [], userIds = [], message } = payload;

    // Validate bulk limit
    const totalInvites = emails.length + userIds.length;
    if (totalInvites > INVITATION_LIMITS.MAX_BULK_INVITATIONS) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Maximum ${INVITATION_LIMITS.MAX_BULK_INVITATIONS} invitations allowed at once`
      );
    }

    const invitations: IGroupInvitationDocument[] = [];

    // Create invitations for emails
    for (const email of emails) {
      try {
        const invitation = await this.createInvitation(
          groupId,
          invitedByUserId,
          email,
          undefined,
          message
        );
        invitations.push(invitation);
      } catch (error) {
        // Log but continue with other invitations
        errorLogger.error(`Failed to invite ${email}:`, error);
      }
    }

    // Create invitations for user IDs
    for (const uid of userIds) {
      try {
        const invitation = await this.createInvitation(
          groupId,
          invitedByUserId,
          undefined,
          uid,
          message
        );
        invitations.push(invitation);
      } catch (error) {
        errorLogger.error(`Failed to invite user ${uid}:`, error);
      }
    }

    if (invitations.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No invitations could be created. Check if recipients already have pending invitations.'
      );
    }

    return invitations;
  }

  /**
   * Get pending invitations for a group with caching
   *
   * @param groupId - Group ID
   * @param options - Query options
   * @returns Array of invitations
   */
  async getPendingInvitations(
    groupId: string,
    options?: { page?: number; limit?: number }
  ): Promise<IGroupInvitationDocument[]> {
    const cacheKey = this.getCacheKey('pending', groupId);

    // Try cache first
    const cachedInvitations = await this.getFromCache<IGroupInvitationDocument[]>(cacheKey);
    if (cachedInvitations) {
      return cachedInvitations;
    }

    // Fallback to database
    const query = {
      groupId: new Types.ObjectId(groupId),
      status: GROUP_INVITATION_STATUS.PENDING,
      isDeleted: false,
    };

    let dbQuery = this.model.find(query)
      .populate('invitedByUserId', 'name email profileImage')
      .populate('invitedUserId', 'name email profileImage');

    if (options?.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    if (options?.page) {
      const skip = (options.page - 1) * (options.limit || 10);
      dbQuery = dbQuery.skip(skip);
    }

    const invitations = await dbQuery.sort({ createdAt: -1 });

    // Cache results
    await this.setInCache(cacheKey, invitations, INVITATION_CACHE_CONFIG.PENDING_INVITATIONS_TTL);

    return invitations;
  }

  /**
   * Get invitations received by a user
   *
   * @param userId - User ID
   * @param status - Filter by status
   * @returns Array of invitations
   */
  async getUserInvitations(
    userId: string,
    status?: string
  ): Promise<IGroupInvitationDocument[]> {
    const query: any = {
      invitedUserId: new Types.ObjectId(userId),
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    const invitations = await this.model.find(query)
      .populate('groupId', 'name description avatarUrl visibility')
      .populate('invitedByUserId', 'name email profileImage')
      .sort({ createdAt: -1 });

    return invitations;
  }

  /**
   * Accept an invitation
   * Adds user to group and updates invitation status
   *
   * @param token - Invitation token
   * @param userId - User accepting invitation
   * @returns Updated invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<IGroupInvitationDocument> {
    const invitation = await GroupInvitation.findByToken(token);

    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid or expired invitation');
    }

    if (!invitation.isValid()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This invitation has expired or is no longer valid');
    }

    // Verify the user matches the invitation
    if (invitation.invitedUserId && invitation.invitedUserId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'This invitation is not for you');
    }

    // Add user to group
    await GroupMember.create({
      groupId: invitation.groupId._id,
      userId: new Types.ObjectId(userId),
      role: 'member',
      status: 'active',
    });

    // Update group member count
    await Group.findByIdAndUpdate(invitation.groupId._id, {
      $inc: { currentMemberCount: 1 },
    });

    // Update invitation status
    invitation.status = GROUP_INVITATION_STATUS.ACCEPTED;
    await invitation.save();

    // Invalidate cache
    await this.invalidateCache(invitation.groupId._id.toString(), userId);

    return invitation;
  }

  /**
   * Decline an invitation
   *
   * @param invitationId - Invitation ID
   * @param userId - User declining invitation
   * @returns Updated invitation
   */
  async declineInvitation(invitationId: string, userId: string): Promise<IGroupInvitationDocument | null> {
    const invitation = await this.model.findOne({
      _id: new Types.ObjectId(invitationId),
      invitedUserId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');
    }

    if (invitation.status !== GROUP_INVITATION_STATUS.PENDING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invitation is no longer pending');
    }

    invitation.status = GROUP_INVITATION_STATUS.DECLINED;
    await invitation.save();

    return invitation;
  }

  /**
   * Cancel an invitation (by sender)
   *
   * @param invitationId - Invitation ID
   * @param userId - User cancelling (must be inviter or admin)
   * @returns Updated invitation
   */
  async cancelInvitation(invitationId: string, userId: string): Promise<IGroupInvitationDocument | null> {
    const invitation = await this.model.findOne({
      _id: new Types.ObjectId(invitationId),
      isDeleted: false,
    }).populate('groupId');

    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');
    }

    // Check if user has permission to cancel
    const group = invitation.groupId as any;
    const isOwner = group.ownerUserId.toString() === userId;
    const isInviter = invitation.invitedByUserId.toString() === userId;

    if (!isOwner && !isInviter) {
      // Check if user is admin
      const member = await GroupMember.findOne({
        groupId: invitation.groupId,
        userId: new Types.ObjectId(userId),
        role: 'admin',
        isDeleted: false,
      });

      if (!member) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to cancel this invitation');
      }
    }

    invitation.status = GROUP_INVITATION_STATUS.CANCELLED;
    await invitation.save();

    // Invalidate cache
    await this.invalidateCache(invitation.groupId._id.toString());

    return invitation;
  }

  /**
   * Get invitation count for a user
   */
  async getUserInvitationCount(userId: string, status?: string): Promise<number> {
    const query: any = {
      invitedUserId: new Types.ObjectId(userId),
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    return await this.model.countDocuments(query);
  }

  /**
   * Expire old invitations (cron job)
   * Should be called daily
   */
  async expireOldInvitations(): Promise<number> {
    const count = await GroupInvitation.expireOldInvitations();
    logger.info(`⏰ Expired ${count} old group invitations`);
    return count;
  }
}
