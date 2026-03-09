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
|  Business User | 01-01 | Create child account
|  Role: Business User | Module: ChildrenBusinessUser
|  Action: Create a new child account and add to family
|  Auth: Required (commonUser with business subscription)
|  Rate Limit: 10 requests per hour
|  Figma: teacher-parent-dashboard/team-members/create-child-flow.png
└──────────────────────────────────*/
router.post(
  '/children',
  auth(TRole.commonUser),
  createChildLimiter,
  validateRequest(validation.createChildValidationSchema),
  controller.createChild
);

/*-─────────────────────────────────
|  Business User | 01-02 | Get all my children
|  Role: Business User | Module: ChildrenBusinessUser
|  Action: Get all children accounts with pagination
|  Auth: Required (commonUser with business subscription)
|  Rate Limit: 100 requests per minute
|  Figma: teacher-parent-dashboard/team-members/team-member-flow-01.png
└──────────────────────────────────*/
router.get(
  '/my-children',
  auth(TRole.commonUser),
  childrenLimiter,
  validateRequest(validation.getChildrenValidationSchema),
  controller.getMyChildren
);

/*-─────────────────────────────────
|  Child | 01-03 | Get my parent business user
|  Role: Child User | Module: ChildrenBusinessUser
|  Action: Get parent business user details
|  Auth: Required (commonUser - child account)
|  Rate Limit: 100 requests per minute
|  Figma: app-user/group-children-user/profile-permission-account-interface.png
└──────────────────────────────────*/
router.get(
  '/my-parent',
  auth(TRole.commonUser),
  childrenLimiter,
  controller.getParentBusinessUser
);

/*-─────────────────────────────────
|  Business User | 01-04 | Remove child from family
|  Role: Business User | Module: ChildrenBusinessUser
|  Action: Remove a child account from family (soft delete)
|  Auth: Required (commonUser with business subscription)
|  Rate Limit: 20 requests per hour
|  Figma: teacher-parent-dashboard/team-members/edit-child-flow.png
└──────────────────────────────────*/
router.delete(
  '/children/:childId',
  auth(TRole.commonUser),
  childrenLimiter,
  validateRequest(validation.removeChildValidationSchema),
  controller.removeChild
);

/*-─────────────────────────────────
|  Business User | 01-05 | Reactivate child account
|  Role: Business User | Module: ChildrenBusinessUser
|  Action: Reactivate a previously removed child account
|  Auth: Required (commonUser with business subscription)
|  Rate Limit: 20 requests per hour
└──────────────────────────────────*/
router.post(
  '/children/:childId/reactivate',
  auth(TRole.commonUser),
  childrenLimiter,
  controller.reactivateChild
);

/*-─────────────────────────────────
|  Business User | 01-06 | Get children statistics
|  Role: Business User | Module: ChildrenBusinessUser
|  Action: Get statistics about children accounts
|  Auth: Required (commonUser with business subscription)
|  Rate Limit: 100 requests per minute
|  Figma: teacher-parent-dashboard/dashboard/dashboard-flow-01.png
└──────────────────────────────────*/
router.get(
  '/statistics',
  auth(TRole.commonUser),
  childrenLimiter,
  controller.getStatistics
);

export const ChildrenBusinessUserRoute = router;
