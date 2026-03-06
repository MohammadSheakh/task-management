//@ts-ignore
import express from 'express';
import { GroupController } from './group.controller';
import { IGroupDocument } from './group.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { defaultExcludes } from '../../../constants/queryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import { checkLoggedInUsersPermissionToManipulateModel } from '../../../middlewares/checkPermissionToManipulateModel';
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

//-------------------------------------------
// Owner | Group #01 | Create a new group
//-------------------------------------------
router.route('/').post(
  auth(TRole.user),
  createGroupLimiter,
  controller.create
);

//-------------------------------------------
// User | Group #02 | Get all my groups with pagination
//-------------------------------------------
router.route('/my').get(
  auth(TRole.user),
  groupLimiter,
  validateFiltersForQuery(optionValidationChecking(['visibility', 'status', ...paginationOptions])),
  controller.getMyGroups
);

//-------------------------------------------
// User | Group #03 | Get group details by ID
//-------------------------------------------
router.route('/:id').get(
  auth(TRole.user),
  groupLimiter,
  setQueryOptions({
    populate: [
      { path: 'ownerUserId', select: 'name email profileImage role' },
    ],
    select: `-__v`,
  }),
  controller.getGroupById
);

//-------------------------------------------
// Owner/Admin | Group #04 | Update group by ID
//-------------------------------------------
router.route('/:id').put(
  auth(TRole.user),
  groupLimiter,
  controller.updateById
);

//-------------------------------------------
// Owner | Group #05 | Delete group by ID (soft delete)
//-------------------------------------------
router.route('/:id').delete(
  auth(TRole.user),
  groupLimiter,
  controller.deleteById
);

//-------------------------------------------
// User | Group #06 | Get group statistics
//-------------------------------------------
router.route('/:id/statistics').get(
  auth(TRole.user),
  groupLimiter,
  controller.getStatistics
);

//-------------------------------------------
// User | Group #07 | Search groups
//-------------------------------------------
router.route('/search').get(
  auth(TRole.user),
  groupLimiter,
  controller.searchGroups
);

export const GroupRoute = router;
