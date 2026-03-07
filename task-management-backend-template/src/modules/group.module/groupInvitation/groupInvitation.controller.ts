import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { GroupInvitation } from './groupInvitation.model';
import { IGroupInvitationDocument } from './groupInvitation.interface';
import { GroupInvitationService } from './groupInvitation.service';
import { TRole } from '../../../middlewares/roles';
import ApiError from '../../../errors/ApiError';

/**
 * GroupInvitation Controller
 * Handles HTTP requests for group invitation operations
 *
 * Features:
 * - BullMQ async email processing
 * - Token-based acceptance
 * - Bulk invitation support
 * - Comprehensive error handling
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class GroupInvitationController extends GenericController<typeof GroupInvitation, IGroupInvitationDocument> {
  groupInvitationService: GroupInvitationService;

  constructor() {
    super(new GroupInvitationService(), 'GroupInvitation');
    this.groupInvitationService = new GroupInvitationService();
  }

  /**
   * Send invitation to a single recipient
   * Owner/Admin | GroupInvitation #01 | Send invitation
   *
   * @param {string} id - Group ID
   * @body {string} email - Email to invite
   * @body {string} userId - Optional user ID
   * @body {string} message - Optional message
   */
  sendInvitation = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const { email, userId, message } = req.body;
    const invitedByUserId = req.user?.userId;

    if (!invitedByUserId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (!email && !userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email or userId is required');
    }

    const result = await this.groupInvitationService.createInvitation(
      groupId,
      invitedByUserId,
      email,
      userId,
      message
    );

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: 'Invitation sent successfully. Email will be delivered shortly.',
      success: true,
    });
  };

  /**
   * Send bulk invitations
   * Owner/Admin | GroupInvitation #02 | Send bulk invitations
   *
   * @param {string} id - Group ID
   * @body {string[]} emails - Array of emails
   * @body {string[]} userIds - Array of user IDs
   * @body {string} message - Optional message
   */
  sendBulkInvitations = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const { emails, userIds, message } = req.body;
    const invitedByUserId = req.user?.userId;

    if (!invitedByUserId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if ((!emails || emails.length === 0) && (!userIds || userIds.length === 0)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one email or userId is required');
    }

    const result = await this.groupInvitationService.createBulkInvitations(
      groupId,
      invitedByUserId,
      { emails, userIds, message }
    );

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: `${result.length} invitations sent successfully`,
      success: true,
    });
  };

  /**
   * Get pending invitations for a group
   * User | GroupInvitation #03 | Get pending invitations
   *
   * @param {string} id - Group ID
   * @query {number} page - Page number
   * @query {number} limit - Items per page
   */
  getPendingInvitations = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await this.groupInvitationService.getPendingInvitations(groupId, options);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Pending invitations retrieved successfully',
      success: true,
    });
  };

  /**
   * Get my received invitations
   * User | GroupInvitation #04 | Get my invitations
   *
   * @query {string} status - Filter by status (pending|accepted|declined|expired)
   */
  getMyInvitations = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const status = req.query.status as string | undefined;

    const result = await this.groupInvitationService.getUserInvitations(userId, status);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Invitations retrieved successfully',
      success: true,
    });
  };

  /**
   * Accept invitation
   * User | GroupInvitation #05 | Accept invitation
   *
   * @body {string} token - Invitation token (from email)
   */
  acceptInvitation = async (req: Request, res: Response) => {
    const { token } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (!token) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invitation token is required');
    }

    const result = await this.groupInvitationService.acceptInvitation(token, userId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Successfully joined the group!',
      success: true,
    });
  };

  /**
   * Decline invitation
   * User | GroupInvitation #06 | Decline invitation
   *
   * @param {string} id - Invitation ID
   */
  declineInvitation = async (req: Request, res: Response) => {
    const invitationId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.groupInvitationService.declineInvitation(invitationId, userId);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Invitation declined',
      success: true,
    });
  };

  /**
   * Cancel invitation
   * Owner/Admin | GroupInvitation #07 | Cancel invitation
   *
   * @param {string} id - Invitation ID
   */
  cancelInvitation = async (req: Request, res: Response) => {
    const invitationId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.groupInvitationService.cancelInvitation(invitationId, userId);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Invitation cancelled successfully',
      success: true,
    });
  };

  /**
   * Get invitation count
   * User | GroupInvitation #08 | Get my invitation count
   *
   * @query {string} status - Filter by status
   */
  getInvitationCount = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const status = req.query.status as string | undefined;
    const count = await this.groupInvitationService.getUserInvitationCount(userId, status);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: { count },
      message: 'Invitation count retrieved successfully',
      success: true,
    });
  };
}
