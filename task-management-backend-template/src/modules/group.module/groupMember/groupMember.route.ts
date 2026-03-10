//@ts-ignore
import express from 'express';
import { GroupMemberController } from './groupMember.controller';
import { IGroupMemberDocument } from './groupMember.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
//@ts-ignore
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../group/group.constant';
import validateRequest from '../../../shared/validateRequest';
import * as validation from './groupMember.validation';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IGroupMemberDocument | 'sortBy' | 'page' | 'limit' | 'populate'>(
  filters: T[]
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

const controller = new GroupMemberController();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for membership operations
 */
const membershipLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ────────────────────────────────────────────────────────────

/*-─────────────────────────────────
|  Business | GroupMember | team-member-flow-01.png | Get all members of a group
|  @desc Group owner/admin retrieves all group members
|  @auth Business user (group member)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/members').get(
  auth(TRole.business),
  membershipLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'role', ...paginationOptions])),
  controller.getGroupMembers
);

/*-─────────────────────────────────
|  Business | GroupMember | team-member-flow-01.png | Get specific member details
|  @desc Retrieve individual member information
|  @auth Business user (group member)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:groupId/members/:userId').get(
  auth(TRole.business),
  membershipLimiter,
  setQueryOptions({
    populate: [
      { path: 'userId', select: 'name email profileImage role' },
    ],
    select: `-__v`,
  }),
  controller.getMember
);

/*-─────────────────────────────────
|  Business | GroupMember | team-member-flow-01.png | Add member to group
|  @desc Group owner/admin adds a new member
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/members').post(
  auth(TRole.business),
  membershipLimiter,
  controller.addMember
);

/*-─────────────────────────────────
|  Business | GroupMember | team-member-flow-01.png | Update member role
|  @desc Group owner promotes/demotes member role
|  @auth Business user (group owner)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:groupId/members/:userId/role').put(
  auth(TRole.business),
  membershipLimiter,
  controller.updateMemberRole
);

/*-─────────────────────────────────
|  Business | GroupMember | team-member-flow-01.png | Remove member from group
|  @desc Group owner/admin removes a member
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:groupId/members/:userId').delete(
  auth(TRole.business),
  membershipLimiter,
  controller.removeMember
);

/*-─────────────────────────────────
|  Child | GroupMember | home-flow.png | Leave a group (self-removal)
|  @desc Child/secondary user leaves the group voluntarily
|  @auth Child user (group member)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/leave').post(
  auth(TRole.commonUser),
  membershipLimiter,
  controller.leaveGroup
);

/*-─────────────────────────────────
|  Business | GroupMember | dashboard-flow-01.png | Get member count
|  @desc Get total number of group members
|  @auth Business user (group member)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/count').get(
  auth(TRole.business),
  membershipLimiter,
  controller.getMemberCount
);

/*-─────────────────────────────────
|  Business | GroupMember | team-member-flow-01.png | Check if user is member
|  @desc Verify user's membership status
|  @auth Business user
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:groupId/check/:userId').get(
  auth(TRole.business),
  membershipLimiter,
  controller.checkMembership
);

// ────────────────────────────────────────────────────────────────────────
// Group Permissions Routes (Settings/Permission Section)
// Figma: teacher-parent-dashboard/settings-permission-section/permission-flow.png
// ────────────────────────────────────────────────────────────────────────

/*-─────────────────────────────────
|  Business | GroupMember | permission-flow.png | Get group permissions
|  @desc Get which members have task creation permissions
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/permissions').get(
  auth(TRole.business),
  membershipLimiter,
  controller.getGroupPermissions
);

/*-─────────────────────────────────
|  Business | GroupMember | permission-flow.png | Update group permissions
|  @desc Grant/revoke task creation permissions for members
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/permissions').put(
  auth(TRole.business),
  membershipLimiter,
  validateRequest(validation.updateGroupPermissionsValidationSchema),
  controller.updateGroupPermissions
);

/*-─────────────────────────────────
|  Business | GroupMember | permission-flow.png | Toggle task creation permission
|  @desc Enable/disable task creation for a specific member
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/permissions/toggle').post(
  auth(TRole.business),
  membershipLimiter,
  validateRequest(validation.toggleTaskCreationPermissionValidationSchema),
  controller.toggleTaskCreationPermission
);

// ────────────────────────────────────────────────────────────────────────
// Figma-Aligned Routes: Direct Member Creation & Profile Management
// Figma: teacher-parent-dashboard/team-members/create-child-flow.png
//        teacher-parent-dashboard/team-members/edit-child-flow.png
// ────────────────────────────────────────────────────────────────────────

/*-─────────────────────────────────
|  Business | GroupMember | create-child-flow.png | Create member account
|  @desc Primary user creates a secondary user account and adds to group
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/members/create').post(
  auth(TRole.business),
  membershipLimiter,
  validateRequest(validation.createMemberAccountValidationSchema),
  controller.createMemberAccount
);

/*-─────────────────────────────────
|  Business | GroupMember | edit-child-flow.png | Update member profile
|  @desc Primary user updates a member's profile information
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/members/:userId/profile').patch(
  auth(TRole.business),
  membershipLimiter,
  validateRequest(validation.updateMemberProfileValidationSchema),
  controller.updateMemberProfile
);

export const GroupMemberRoute = router;
