import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Types } from 'mongoose';
import { Group } from './group/group.model';
import { GroupMember } from './groupMember/groupMember.model';
import { GROUP_MEMBER_ROLES, GROUP_MEMBER_STATUS, MEMBER_PERMISSIONS } from './groupMember/groupMember.constant';
import { GROUP_STATUS } from './group/group.constant';

/**
 * Check if user is a member of a group
 * Used for protecting group-specific routes
 */
export function isGroupMember(groupIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const groupId = req.params[groupIdParam];

      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
      }

      if (!groupId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Group ID is required');
      }

      const isMember = await GroupMember.isUserMember(
        new Types.ObjectId(groupId),
        new Types.ObjectId(userId)
      );

      if (!isMember) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not a member of this group');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user is owner or admin of a group
 * Used for protecting admin-level group operations
 */
export function isGroupAdmin(groupIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const groupId = req.params[groupIdParam];

      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
      }

      if (!groupId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Group ID is required');
      }

      const member = await GroupMember.findOne({
        groupId: new Types.ObjectId(groupId),
        userId: new Types.ObjectId(userId),
        status: GROUP_MEMBER_STATUS.ACTIVE,
        isDeleted: false,
      });

      if (!member) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not a member of this group');
      }

      if (member.role !== GROUP_MEMBER_ROLES.OWNER && member.role !== GROUP_MEMBER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Only group owners and admins can perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user is owner of a group
 * Used for protecting owner-only operations (delete group, transfer ownership)
 */
export function isGroupOwner(groupIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const groupId = req.params[groupIdParam];

      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
      }

      if (!groupId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Group ID is required');
      }

      const group = await Group.findById(groupId);

      if (!group) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
      }

      if (group.ownerUserId.toString() !== userId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Only the group owner can perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if group is active and accepting operations
 * Used to prevent operations on suspended/archived groups
 */
export function isGroupActive(groupIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = req.params[groupIdParam];

      if (!groupId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Group ID is required');
      }

      const group = await Group.findById(groupId);

      if (!group) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
      }

      if (group.status !== GROUP_STATUS.ACTIVE) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'This group is not active');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user has specific permission in a group
 * @param permission - Permission to check (e.g., 'CAN_INVITE_MEMBERS')
 */
export function hasGroupPermission(permission: keyof typeof MEMBER_PERMISSIONS.OWNER) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const groupId = req.params.id;

      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
      }

      if (!groupId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Group ID is required');
      }

      const member = await GroupMember.findOne({
        groupId: new Types.ObjectId(groupId),
        userId: new Types.ObjectId(userId),
        status: GROUP_MEMBER_STATUS.ACTIVE,
        isDeleted: false,
      });

      if (!member) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not a member of this group');
      }

      const permissions = MEMBER_PERMISSIONS[member.role.toUpperCase() as keyof typeof MEMBER_PERMISSIONS];

      if (!permissions || !permissions[permission]) {
        throw new ApiError(StatusCodes.FORBIDDEN, `You do not have permission to ${permission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validate group invitation token
 * Used for email-based invitation acceptance
 */
export function validateInvitationToken() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invitation token is required');
      }

      // Token validation will be done in service layer
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if group has reached maximum member capacity
 * Used before adding new members
 */
export function isGroupFull(groupIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = req.params[groupIdParam];

      if (!groupId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Group ID is required');
      }

      const group = await Group.findById(groupId);

      if (!group) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
      }

      if (group.currentMemberCount >= group.maxMembers) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `This group has reached its maximum capacity of ${group.maxMembers} members`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
