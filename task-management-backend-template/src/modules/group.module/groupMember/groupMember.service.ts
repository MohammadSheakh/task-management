import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { GroupMember } from './groupMember.model';
import { IGroupMember, IGroupMemberDocument } from './groupMember.interface';
import { GenericService } from '../../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { redisClient } from '../../../helpers/redis/redis';
import { GROUP_MEMBER_STATUS, GROUP_MEMBER_ROLES, MEMBER_CACHE_CONFIG } from './groupMember.constant';
import { errorLogger } from '../../../shared/logger';
import { Group } from '../group/group.model';

/**
 * GroupMember Service
 * Handles business logic for group membership operations
 * Extends GenericService for CRUD operations
 *
 * Features:
 * - Redis caching for member lists
 * - Automatic cache invalidation
 * - Membership validation
 * - Role-based permission checks
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class GroupMemberService extends GenericService<typeof GroupMember, IGroupMemberDocument> {
  constructor() {
    super(GroupMember);
  }

  /**
   * Cache Key Generator
   */
  private getCacheKey(type: 'members' | 'member' | 'userGroups', groupId?: string, userId?: string): string {
    const prefix = MEMBER_CACHE_CONFIG.PREFIX;
    if (type === 'members' && groupId) {
      return `${prefix}:group:${groupId}:members`;
    }
    if (type === 'member' && groupId && userId) {
      return `${prefix}:group:${groupId}:user:${userId}`;
    }
    if (type === 'userGroups' && userId) {
      return `user:${userId}:groups`;
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
        this.getCacheKey('members', groupId),
      ];

      if (userId) {
        keysToDelete.push(this.getCacheKey('member', groupId, userId));
        keysToDelete.push(this.getCacheKey('userGroups', undefined, userId));
      }

      await redisClient.del(keysToDelete);
    } catch (error) {
      errorLogger.error('Redis DELETE error:', error);
    }
  }

  /**
   * Add a member to a group
   * Validates membership before creating
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @param role - Member role (default: member)
   * @returns Created membership
   */
  async addMember(
    groupId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' = 'member'
  ): Promise<IGroupMemberDocument> {
    const groupObjectId = new Types.ObjectId(groupId);
    const userObjectId = new Types.ObjectId(userId);

    // Check if user is already a member
    const isMember = await GroupMember.isUserMember(groupObjectId, userObjectId);
    if (isMember) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'User is already a member of this group'
      );
    }

    // Verify group exists and is active
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
    }

    if (group.status !== 'active') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot join an inactive group'
      );
    }

    // Check if group is full
    if (group.currentMemberCount >= group.maxMembers) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This group has reached its maximum member capacity'
      );
    }

    // Create membership
    const member = await this.model.create({
      groupId: groupObjectId,
      userId: userObjectId,
      role,
      status: GROUP_MEMBER_STATUS.ACTIVE,
    });

    // Update group member count
    await Group.findByIdAndUpdate(
      groupId,
      { $inc: { currentMemberCount: 1 } }
    );

    // Invalidate cache
    await this.invalidateCache(groupId, userId);

    return member;
  }

  /**
   * Get all members of a group with caching
   *
   * @param groupId - Group ID
   * @param options - Query options
   * @returns Array of members
   */
  async getGroupMembers(
    groupId: string,
    options?: { page?: number; limit?: number }
  ): Promise<IGroupMemberDocument[]> {
    const cacheKey = this.getCacheKey('members', groupId);

    // Try cache first
    const cachedMembers = await this.getFromCache<IGroupMemberDocument[]>(cacheKey);
    if (cachedMembers) {
      return cachedMembers;
    }

    // Fallback to database
    const query = {
      groupId: new Types.ObjectId(groupId),
      status: GROUP_MEMBER_STATUS.ACTIVE,
      isDeleted: false,
    };

    let dbQuery = this.model.find(query).populate('userId', 'name email profileImage role');

    if (options?.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    if (options?.page) {
      const skip = (options.page - 1) * (options.limit || 10);
      dbQuery = dbQuery.skip(skip);
    }

    const members = await dbQuery.sort({ role: 1, joinedAt: -1 });

    // Cache results
    await this.setInCache(cacheKey, members, MEMBER_CACHE_CONFIG.MEMBER_LIST_TTL);

    return members;
  }

  /**
   * Get a specific member's membership
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns Member document or null
   */
  async getMember(groupId: string, userId: string): Promise<IGroupMemberDocument | null> {
    const cacheKey = this.getCacheKey('member', groupId, userId);

    // Try cache first
    const cachedMember = await this.getFromCache<IGroupMemberDocument>(cacheKey);
    if (cachedMember) {
      return cachedMember;
    }

    // Fallback to database
    const member = await this.model.findOne({
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    }).populate('userId', 'name email profileImage role');

    if (member) {
      await this.setInCache(cacheKey, member, MEMBER_CACHE_CONFIG.MEMBER_TTL);
    }

    return member;
  }

  /**
   * Update member role
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @param newRole - New role
   * @param updatedByUserId - User performing the update
   * @returns Updated member
   */
  async updateMemberRole(
    groupId: string,
    userId: string,
    newRole: 'owner' | 'admin' | 'member',
    updatedByUserId: string
  ): Promise<IGroupMemberDocument | null> {
    const member = await this.model.findOne({
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    member.role = newRole;
    await member.save();

    // Invalidate cache
    await this.invalidateCache(groupId, userId);

    return member;
  }

  /**
   * Remove a member from a group
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @param removedByUserId - User performing the removal
   * @returns Removed member
   */
  async removeMember(
    groupId: string,
    userId: string,
    removedByUserId: string
  ): Promise<IGroupMemberDocument | null> {
    const member = await this.model.findOne({
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    // Prevent removing the last owner
    if (member.role === GROUP_MEMBER_ROLES.OWNER) {
      const ownerCount = await this.model.countDocuments({
        groupId: new Types.ObjectId(groupId),
        role: GROUP_MEMBER_ROLES.OWNER,
        isDeleted: false,
      });

      if (ownerCount <= 1) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Cannot remove the only owner from the group. Please transfer ownership first.'
        );
      }
    }

    member.isDeleted = true;
    await member.save();

    // Update group member count
    await Group.findByIdAndUpdate(
      groupId,
      { $inc: { currentMemberCount: -1 } }
    );

    // Invalidate cache
    await this.invalidateCache(groupId, userId);

    return member;
  }

  /**
   * Leave a group (self-removal)
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns Removed member
   */
  async leaveGroup(groupId: string, userId: string): Promise<IGroupMemberDocument | null> {
    return this.removeMember(groupId, userId, userId);
  }

  /**
   * Get member count for a group
   *
   * @param groupId - Group ID
   * @returns Member count
   */
  async getMemberCount(groupId: string): Promise<number> {
    return await GroupMember.getMemberCount(new Types.ObjectId(groupId));
  }

  /**
   * Check if user is a member of a group
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns True if member
   */
  async isUserMember(groupId: string, userId: string): Promise<boolean> {
    return await GroupMember.isUserMember(new Types.ObjectId(groupId), new Types.ObjectId(userId));
  }

  /**
   * Get all groups for a user
   *
   * @param userId - User ID
   * @returns Array of group IDs
   */
  async getUserGroupIds(userId: string): Promise<Types.ObjectId[]> {
    const memberships = await this.model.find({
      userId: new Types.ObjectId(userId),
      status: GROUP_MEMBER_STATUS.ACTIVE,
      isDeleted: false,
    }).select('groupId');

    return memberships.map(m => m.groupId);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Group Permissions Methods
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get group permissions
   * Returns all members with their permission settings
   *
   * @param groupId - Group ID
   * @returns Object with allowSecondaryTasks and membersWithPermission
   */
  async getGroupPermissions(groupId: string) {
    const members = await this.model.find({
      groupId: new Types.ObjectId(groupId),
      status: GROUP_MEMBER_STATUS.ACTIVE,
      isDeleted: false,
    })
      .populate('userId', 'name email profileImage')
      .populate('grantedBy', 'name')
      .select('userId permissions grantedAt')
      .lean();

    // Check if any secondary user has task creation permission
    const allowSecondaryTasks = members.some(
      m => m.userId && m.permissions?.canCreateTasks === true
    );

    // Filter members with permissions
    const membersWithPermission = members
      .filter(m => m.permissions && (m.permissions.canCreateTasks || m.permissions.canInviteMembers || m.permissions.canRemoveMembers))
      .map(m => ({
        _groupMemberId: m._id,
        userId: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        profileImage: m.userId.profileImage,
        permissions: m.permissions,
        grantedAt: m.grantedAt,
      }));

    return {
      groupId,
      allowSecondaryTasks,
      membersWithPermission,
    };
  }

  /**
   * Update group permissions
   * Bulk update permissions for multiple members
   *
   * @param groupId - Group ID
   * @param updates - Array of permission updates
   * @param userId - User making the update (for grantedBy)
   * @returns Updated permissions info
   */
  async updateGroupPermissions(
    groupId: string,
    updates: Array<{ userId: string; canCreateTasks?: boolean; canInviteMembers?: boolean; canRemoveMembers?: boolean }>,
    userId: string
  ) {
    const updateOperations = updates.map(update => ({
      updateOne: {
        filter: {
          groupId: new Types.ObjectId(groupId),
          userId: new Types.ObjectId(update.userId),
          isDeleted: false,
        },
        update: {
          $set: {
            'permissions.canCreateTasks': update.canCreateTasks ?? false,
            'permissions.canInviteMembers': update.canInviteMembers ?? false,
            'permissions.canRemoveMembers': update.canRemoveMembers ?? false,
            'permissions.grantedBy': new Types.ObjectId(userId),
            'permissions.grantedAt': new Date(),
          },
        },
      },
    }));

    const result = await this.model.bulkWrite(updateOperations);

    // Invalidate cache
    await this.invalidateCache(groupId);

    // Get updated permissions
    return await this.getGroupPermissions(groupId);
  }

  /**
   * Toggle task creation permission for a member
   *
   * @param groupId - Group ID
   * @param userId - Member User ID
   * @param canCreateTasks - Permission value
   * @param grantedBy - User granting permission
   * @returns Updated member
   */
  async toggleTaskCreationPermission(
    groupId: string,
    userId: string,
    canCreateTasks: boolean,
    grantedBy: string
  ) {
    const member = await this.model.findOneAndUpdate(
      {
        groupId: new Types.ObjectId(groupId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      {
        $set: {
          'permissions.canCreateTasks': canCreateTasks,
          'permissions.grantedBy': new Types.ObjectId(grantedBy),
          'permissions.grantedAt': new Date(),
        },
      },
      { new: true }
    ).populate('userId', 'name email profileImage');

    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    // Invalidate cache
    await this.invalidateCache(groupId);

    return member;
  }

  /**
   * Check if user has permission to create tasks in group
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns True if user can create tasks
   */
  async canCreateTasks(groupId: string, userId: string): Promise<boolean> {
    const member = await this.model.findOne({
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      status: GROUP_MEMBER_STATUS.ACTIVE,
      isDeleted: false,
    }).select('permissions role');

    if (!member) {
      return false;
    }

    // Owner and admin can always create tasks
    if (member.role === GROUP_MEMBER_ROLES.OWNER || member.role === GROUP_MEMBER_ROLES.ADMIN) {
      return true;
    }

    // Check explicit permission
    return member.permissions?.canCreateTasks === true;
  }

  /**
   * Check if user has permission to invite members
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns True if user can invite members
   */
  async canInviteMembers(groupId: string, userId: string): Promise<boolean> {
    const member = await this.model.findOne({
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      status: GROUP_MEMBER_STATUS.ACTIVE,
      isDeleted: false,
    }).select('permissions role');

    if (!member) {
      return false;
    }

    // Owner and admin can always invite
    if (member.role === GROUP_MEMBER_ROLES.OWNER || member.role === GROUP_MEMBER_ROLES.ADMIN) {
      return true;
    }

    // Check explicit permission
    return member.permissions?.canInviteMembers === true;
  }

  /**
   * Check if user has permission to remove members
   *
   * @param groupId - Group ID
   * @param userId - User ID
   * @returns True if user can remove members
   */
  async canRemoveMembers(groupId: string, userId: string): Promise<boolean> {
    const member = await this.model.findOne({
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      status: GROUP_MEMBER_STATUS.ACTIVE,
      isDeleted: false,
    }).select('permissions role');

    if (!member) {
      return false;
    }

    // Owner and admin can always remove
    if (member.role === GROUP_MEMBER_ROLES.OWNER || member.role === GROUP_MEMBER_ROLES.ADMIN) {
      return true;
    }

    // Check explicit permission
    return member.permissions?.canRemoveMembers === true;
  }
}
