import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { Group } from './group.model';
import { IGroupDocument } from './group.interface';
import { GroupService } from './group.service';
import { TRole } from '../../../middlewares/roles';
import ApiError from '../../../errors/ApiError';
import { GroupMemberRoles, GroupStatus, GroupVisibility } from './group.constant';

/**
 * Group Controller
 * Handles HTTP requests for group operations
 * Extends GenericController for standard CRUD operations
 *
 * Features:
 * - Rate limiting integration
 * - Permission-based access control
 * - Comprehensive error handling
 * - Request validation
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class GroupController extends GenericController<typeof Group, IGroupDocument> {
  groupService: GroupService;

  constructor() {
    super(new GroupService(), 'Group');
    this.groupService = new GroupService();
  }

  /**
   * Create a new group
   * Owner | Group #01 | Create a new group
   *
   * @body {string} name - Group name (required)
   * @body {string} description - Group description (optional)
   * @body {string} visibility - Group visibility (private|public|inviteOnly)
   * @body {number} maxMembers - Maximum members (default: 100)
   */
  create = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const groupData = req.body;

    // Validate required fields
    if (!groupData.name) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Group name is required');
    }

    // Set defaults
    if (!groupData.visibility) {
      groupData.visibility = GroupVisibility.PRIVATE;
    }

    if (!groupData.maxMembers) {
      groupData.maxMembers = 100;
    }

    if (!groupData.status) {
      groupData.status = GroupStatus.ACTIVE;
    }

    const result = await this.groupService.createGroup(groupData, userId);

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: 'Group created successfully',
      success: true,
    });
  };

  /**
   * Get all groups for the logged-in user
   * User | Group #02 | Get my groups
   *
   * @query {string} visibility - Filter by visibility
   * @query {string} status - Filter by status
   * @query {string} sortBy - Sort field (default: -createdAt)
   */
  getMyGroups = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const filters = req.query;
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string || '-createdAt',
    };

    const result = await this.groupService.getUserGroupsPaginated(
      userId,
      filters,
      options
    );

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Groups retrieved successfully',
      success: true,
    });
  };

  /**
   * Get group by ID
   * User | Group #03 | Get group details
   *
   * @param {string} id - Group ID
   */
  getGroupById = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const populateOptions = [
      { path: 'ownerUserId', select: 'name email profileImage role' },
    ];

    const select = '-__v';

    const result = await this.groupService.getGroupById(groupId, populateOptions, select);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
    }

    // Verify user has access to this group
    const hasAccess =
      result.ownerUserId._id.toString() === userId ||
      result.visibility !== GroupVisibility.PRIVATE;

    if (!hasAccess) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have access to this group');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Group retrieved successfully',
      success: true,
    });
  };

  /**
   * Update group by ID
   * Owner/Admin | Group #04 | Update group
   *
   * @param {string} id - Group ID
   * @body {string} name - Group name (optional)
   * @body {string} description - Group description (optional)
   * @body {string} visibility - Group visibility (optional)
   * @body {number} maxMembers - Maximum members (optional)
   */
  updateById = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.ownerUserId;
    delete updateData.currentMemberCount;
    delete updateData.isDeleted;

    const result = await this.groupService.updateGroupById(groupId, updateData, userId);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Group updated successfully',
      success: true,
    });
  };

  /**
   * Delete group by ID (soft delete)
   * Owner | Group #05 | Delete group
   *
   * @param {string} id - Group ID
   */
  deleteById = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.groupService.deleteGroupById(groupId, userId);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Group deleted successfully',
      success: true,
    });
  };

  /**
   * Get group statistics
   * User | Group #06 | Get group statistics
   *
   * @param {string} id - Group ID
   */
  getStatistics = async (req: Request, res: Response) => {
    const groupId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.groupService.getGroupStatistics(groupId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Group statistics retrieved successfully',
      success: true,
    });
  };

  /**
   * Search groups
   * User | Group #07 | Search groups
   *
   * @query {string} q - Search query
   * @query {string} visibility - Filter by visibility
   * @query {string} sortBy - Sort field
   */
  searchGroups = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const searchTerm = req.query.q as string;

    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Search query is required');
    }

    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string || '-currentMemberCount',
    };

    const result = await this.groupService.searchGroups(searchTerm, options);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Groups search completed successfully',
      success: true,
    });
  };
}
