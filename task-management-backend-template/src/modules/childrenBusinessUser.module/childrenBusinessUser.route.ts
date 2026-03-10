//@ts-ignore
import express from 'express';
import { ChildrenBusinessUserController } from './childrenBusinessUser.controller';
import auth from '../../middlewares/auth';
import { TRole } from '../../middlewares/roles';
import validateRequest from '../../shared/validateRequest';
import * as validation from './childrenBusinessUser.validation';
import rateLimit from 'express-rate-limit';
import { CHILDREN_RATE_LIMITS } from './childrenBusinessUser.constant';

const router = express.Router();

/*-─────────────────────────────────
|  Rate Limiter: Create child account
|  Prevents abuse: 10 requests per hour
└──────────────────────────────────*/
const createChildLimiter = rateLimit({
  windowMs: CHILDREN_RATE_LIMITS.CREATE_CHILD.windowMs,
  max: CHILDREN_RATE_LIMITS.CREATE_CHILD.max,
  message: {
    success: false,
    message: CHILDREN_RATE_LIMITS.CREATE_CHILD.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/*-─────────────────────────────────
|  Rate Limiter: General children operations
|  100 requests per minute
└──────────────────────────────────*/
const childrenLimiter = rateLimit({
  windowMs: CHILDREN_RATE_LIMITS.GENERAL.windowMs,
  max: CHILDREN_RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    message: CHILDREN_RATE_LIMITS.GENERAL.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const controller = new ChildrenBusinessUserController();

/*-─────────────────────────────────
|  Business | ChildrenBusinessUser | create-child-flow.png | Create child account
|  @desc Business user creates a child account and adds to family
|  @auth Business user with active subscription
|  @rateLimit 10 requests per hour (prevents abuse)
└──────────────────────────────────*/
router.post(
  '/children',
  auth(TRole.business),
  createChildLimiter,
  validateRequest(validation.createChildValidationSchema),
  controller.createChild
);

/*-─────────────────────────────────
|  Business | ChildrenBusinessUser | team-member-flow-01.png | Get all my children
|  @desc Get all children accounts with pagination
|  @auth Business user (parent/teacher)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.get(
  '/my-children',
  auth(TRole.business),
  childrenLimiter,
  validateRequest(validation.getChildrenValidationSchema),
  controller.getMyChildren
);

/*-─────────────────────────────────
|  Child | ChildrenBusinessUser | profile-permission-account-interface.png | Get my parent business user
|  @desc Child user retrieves their parent business user details
|  @auth Child user (commonUser role)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.get(
  '/my-parent',
  auth(TRole.commonUser),
  childrenLimiter,
  controller.getParentBusinessUser
);

/*-─────────────────────────────────
|  Business | ChildrenBusinessUser | edit-child-flow.png | Remove child from family
|  @desc Remove a child account from family (soft delete)
|  @auth Business user (parent/teacher)
|  @rateLimit 20 requests per hour
└──────────────────────────────────*/
router.delete(
  '/children/:childId',
  auth(TRole.business),
  childrenLimiter,
  validateRequest(validation.removeChildValidationSchema),
  controller.removeChild
);

/*-─────────────────────────────────
|  Business | ChildrenBusinessUser | edit-child-flow.png | Reactivate child account
|  @desc Reactivate a previously removed child account
|  @auth Business user (parent/teacher)
|  @rateLimit 20 requests per hour
└──────────────────────────────────*/
router.post(
  '/children/:childId/reactivate',
  auth(TRole.business),
  childrenLimiter,
  controller.reactivateChild
);

/*-─────────────────────────────────
|  Business | ChildrenBusinessUser | dashboard-flow-01.png | Get children statistics
|  @desc Get statistics about children accounts (active, inactive, removed)
|  @auth Business user (parent/teacher)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.get(
  '/statistics',
  auth(TRole.business),
  childrenLimiter,
  controller.getStatistics
);

export const ChildrenBusinessUserRoute = router;
