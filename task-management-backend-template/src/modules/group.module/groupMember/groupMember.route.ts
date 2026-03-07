//@ts-ignore
import express from 'express';
import { GroupMemberController } from './groupMember.controller';
import { IGroupMemberDocument } from './groupMember.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
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

//-------------------------------------------
// User | GroupMember #01 | Get all members of a group
//-------------------------------------------
router.route('/:id/members').get(
  auth(TRole.user),
  membershipLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'role', ...paginationOptions])),
  controller.getGroupMembers
);

//-------------------------------------------
// User | GroupMember #02 | Get specific member details
//-------------------------------------------
router.route('/:groupId/members/:userId').get(
  auth(TRole.user),
  membershipLimiter,
  setQueryOptions({
    populate: [
      { path: 'userId', select: 'name email profileImage role' },
    ],
    select: `-__v`,
  }),
  controller.getMember
);

//-------------------------------------------
// Owner/Admin | GroupMember #03 | Add member to group
//-------------------------------------------
router.route('/:id/members').post(
  auth(TRole.user),
  membershipLimiter,
  controller.addMember
);

//-------------------------------------------
// Owner | GroupMember #04 | Update member role
//-------------------------------------------
router.route('/:groupId/members/:userId/role').put(
  auth(TRole.user),
  membershipLimiter,
  controller.updateMemberRole
);

//-------------------------------------------
// Owner/Admin | GroupMember #05 | Remove member from group
//-------------------------------------------
router.route('/:groupId/members/:userId').delete(
  auth(TRole.user),
  membershipLimiter,
  controller.removeMember
);

//-------------------------------------------
// User | GroupMember #06 | Leave a group
//-------------------------------------------
router.route('/:id/leave').post(
  auth(TRole.user),
  membershipLimiter,
  controller.leaveGroup
);

//-------------------------------------------
// User | GroupMember #07 | Get member count
//-------------------------------------------
router.route('/:id/count').get(
  auth(TRole.user),
  membershipLimiter,
  controller.getMemberCount
);

//-------------------------------------------
// User | GroupMember #08 | Check if user is member
//-------------------------------------------
router.route('/:groupId/check/:userId').get(
  auth(TRole.user),
  membershipLimiter,
  controller.checkMembership
);

// ────────────────────────────────────────────────────────────────────────
// Group Permissions Routes
// ────────────────────────────────────────────────────────────────────────

//-------------------------------------------
// Primary | GroupMember #09 | Get group permissions
//-------------------------------------------
router.route('/:id/permissions').get(
  auth(TRole.user),
  membershipLimiter,
  controller.getGroupPermissions
);

//-------------------------------------------
// Primary | GroupMember #10 | Update group permissions
//-------------------------------------------
router.route('/:id/permissions').put(
  auth(TRole.user),
  membershipLimiter,
  validateRequest(validation.updateGroupPermissionsValidationSchema),
  controller.updateGroupPermissions
);

//-------------------------------------------
// Primary | GroupMember #11 | Toggle task creation permission
//-------------------------------------------
router.route('/:id/permissions/toggle').post(
  auth(TRole.user),
  membershipLimiter,
  validateRequest(validation.toggleTaskCreationPermissionValidationSchema),
  controller.toggleTaskCreationPermission
);

export const GroupMemberRoute = router;
