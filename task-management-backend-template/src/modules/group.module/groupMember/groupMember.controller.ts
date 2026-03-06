import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../../_generic-module/generic.controller';
import { GroupMember } from './groupMember.model';
import { IGroupMemberDocument } from './groupMember.interface';
import { GroupMemberService } from './groupMember.service';
import { TRole } from '../../../middlewares/roles';
import ApiError from '../../../errors/ApiError';
import { GROUP_MEMBER_ROLES } from './groupMember.constant';

/**
 * GroupMember Controller
 * Handles HTTP requests for group membership operations
 *
 * Features:
 * - Role-based permission checks
 * - Redis-cached member lists
 * - Comprehensive error handling
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class GroupMemberController extends GenericController<typeof GroupMember, IGroupMemberDocument> {
  groupMemberService: GroupMemberService;

  constructor() {
    super(new GroupMemberService(), 'GroupMember');
    this.groupMemberService = new GroupMemberService();
  }

  /**
   * Get all members of a group
   * User | GroupMember #01 | Get group members
   *
   * @param {string} id - Group ID
   * @query {number} page - Page number
   * @query {number} limit - Items per page
   */
  getGroupMembers = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await this.groupMemberService.getGroupMembers(groupId, options);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Group members retrieved successfully',
      success: true,
    });
  };

  /**
   * Get a specific member's details
   * User | GroupMember #02 | Get member details
   *
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   */
  getMember = async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.groupMemberService.getMember(groupId, userId);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Member retrieved successfully',
      success: true,
    });
  };

  /**
   * Add a member to a group
   * Owner/Admin | GroupMember #03 | Add member to group
   *
   * @param {string} id - Group ID
   * @body {string} userId - User ID to add
   * @body {string} role - Role (owner|admin|member)
   */
  addMember = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const { userId, role = 'member' } = req.body;
    const currentUserId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User ID is required');
    }

    if (!['owner', 'admin', 'member'].includes(role)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role');
    }

    const result = await this.groupMemberService.addMember(groupId, userId, role);

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: 'Member added successfully',
      success: true,
    });
  };

  /**
   * Update member role
   * Owner | GroupMember #04 | Update member role
   *
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @body {string} role - New role
   */
  updateMemberRole = async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user?.userId;

    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Valid role is required');
    }

    const result = await this.groupMemberService.updateMemberRole(
      groupId,
      userId,
      role,
      currentUserId!
    );

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Member role updated successfully',
      success: true,
    });
  };

  /**
   * Remove a member from a group
   * Owner/Admin | GroupMember #05 | Remove member from group
   *
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   */
  removeMember = async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user?.userId;

    const result = await this.groupMemberService.removeMember(
      groupId,
      userId,
      currentUserId!
    );

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Member removed successfully',
      success: true,
    });
  };

  /**
   * Leave a group (self-removal)
   * User | GroupMember #06 | Leave group
   *
   * @param {string} id - Group ID
   */
  leaveGroup = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.groupMemberService.leaveGroup(groupId, userId);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Membership not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Successfully left the group',
      success: true,
    });
  };

  /**
   * Get member count for a group
   * User | GroupMember #07 | Get member count
   *
   * @param {string} id - Group ID
   */
  getMemberCount = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const count = await this.groupMemberService.getMemberCount(groupId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: { count },
      message: 'Member count retrieved successfully',
      success: true,
    });
  };

  /**
   * Check if user is a member of a group
   * User | GroupMember #08 | Check membership
   *
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   */
  checkMembership = async (req: Request, res: Response) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User ID is required');
    }

    const isMember = await this.groupMemberService.isUserMember(groupId, userId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: { isMember },
      message: 'Membership check completed',
      success: true,
    });
  };
}
