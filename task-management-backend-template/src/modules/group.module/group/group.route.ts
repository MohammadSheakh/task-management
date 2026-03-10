//@ts-ignore
import express from 'express';
import { GroupController } from './group.controller';
import { IGroupDocument } from './group.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
//@ts-ignore
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from './group.constant';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IGroupDocument | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new GroupController();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for creating groups
 * Prevents spam and resource exhaustion
 */
const createGroupLimiter = rateLimit({
  windowMs: RATE_LIMITS.CREATE_GROUP.windowMs,
  max: RATE_LIMITS.CREATE_GROUP.max,
  message: {
    success: false,
    message: 'Too many group creation attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general group operations
 */
const groupLimiter = rateLimit({
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
|  Business | Group | dashboard-flow-01.png | Create a new group (family/team)
|  @desc Business user (parent/teacher) creates a family/team group
|  @auth Business user with active subscription
|  @rateLimit 5 requests per minute
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.business),
  createGroupLimiter,
  controller.create
);

/*-─────────────────────────────────
|  Business | Group | dashboard-flow-01.png | Get all my groups with pagination
|  @desc Business user retrieves their managed groups
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/my').get(
  auth(TRole.business),
  groupLimiter,
  validateFiltersForQuery(optionValidationChecking(['visibility', 'status', ...paginationOptions])),
  controller.getMyGroups
);

/*-─────────────────────────────────
|  Business | Group | dashboard-flow-01.png | Get group details by ID
|  @desc Retrieve specific group information
|  @auth Business user (group member)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id').get(
  auth(TRole.business),
  groupLimiter,
  setQueryOptions({
    populate: [
      { path: 'ownerUserId', select: 'name email profileImage role' },
    ],
    select: `-__v`,
  }),
  controller.getGroupById
);

/*-─────────────────────────────────
|  Business | Group | dashboard-flow-01.png | Update group by ID
|  @desc Group owner/admin updates group settings
|  @auth Business user (group owner/admin)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id').put(
  auth(TRole.business),
  groupLimiter,
  controller.updateById
);

/*-─────────────────────────────────
|  Business | Group | dashboard-flow-01.png | Delete group by ID (soft delete)
|  @desc Group owner deletes the group
|  @auth Business user (group owner)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id').delete(
  auth(TRole.business),
  groupLimiter,
  controller.deleteById
);

/*-─────────────────────────────────
|  Business | Group | dashboard-flow-01.png | Get group statistics
|  @desc Get member count, utilization, status stats
|  @auth Business user (group member)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/statistics').get(
  auth(TRole.business),
  groupLimiter,
  controller.getStatistics
);

/*-─────────────────────────────────
|  Business | Group | dashboard-flow-01.png | Search groups
|  @desc Search public/invite-only groups
|  @auth Business user
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/search').get(
  auth(TRole.business),
  groupLimiter,
  controller.searchGroups
);

export const GroupRoute = router;
