//@ts-ignore
import express from 'express';
import { GroupInvitationController } from './groupInvitation.controller';
import { IGroupInvitationDocument } from './groupInvitation.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../group/group.constant';
import validateRequest from '../../../shared/validateRequest';
import { z } from 'zod';

const router = express.Router();

export const optionValidationChecking = <T extends keyof IGroupInvitationDocument | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new GroupInvitationController();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for sending invitations
 * Prevents spam
 */
const sendInvitationLimiter = rateLimit({
  windowMs: RATE_LIMITS.SEND_INVITATION.windowMs,
  max: RATE_LIMITS.SEND_INVITATION.max,
  message: {
    success: false,
    message: 'Too many invitation attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general invitation operations
 */
const invitationLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validation Schemas ────────────────────────────────────────────────
/**
 * Single invitation validation
 */
const sendInvitationSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().optional(),
  message: z.string().max(500).optional(),
}).refine(data => data.email || data.userId, {
  message: 'Email or userId is required',
});

/**
 * Bulk invitation validation
 */
const sendBulkInvitationsSchema = z.object({
  emails: z.array(z.string().email()).optional(),
  userIds: z.array(z.string()).optional(),
  message: z.string().max(500).optional(),
}).refine(data => (data.emails && data.emails.length > 0) || (data.userIds && data.userIds.length > 0), {
  message: 'At least one email or userId is required',
});

/**
 * Accept invitation validation
 */
const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// ─── Routes ────────────────────────────────────────────────────────────

//-------------------------------------------
// Owner/Admin | GroupInvitation #01 | Send single invitation
//-------------------------------------------
router.route('/:id/send').post(
  auth(TRole.user),
  sendInvitationLimiter,
  validateRequest(sendInvitationSchema),
  controller.sendInvitation
);

//-------------------------------------------
// Owner/Admin | GroupInvitation #02 | Send bulk invitations
//-------------------------------------------
router.route('/:id/send-bulk').post(
  auth(TRole.user),
  sendInvitationLimiter,
  validateRequest(sendBulkInvitationsSchema),
  controller.sendBulkInvitations
);

//-------------------------------------------
// User | GroupInvitation #03 | Get pending invitations for group
//-------------------------------------------
router.route('/:id/pending').get(
  auth(TRole.user),
  invitationLimiter,
  validateFiltersForQuery(optionValidationChecking([...paginationOptions])),
  controller.getPendingInvitations
);

//-------------------------------------------
// User | GroupInvitation #04 | Get my received invitations
//-------------------------------------------
router.route('/my').get(
  auth(TRole.user),
  invitationLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', ...paginationOptions])),
  controller.getMyInvitations
);

//-------------------------------------------
// User | GroupInvitation #05 | Accept invitation
//-------------------------------------------
router.route('/accept').post(
  auth(TRole.user),
  invitationLimiter,
  validateRequest(acceptInvitationSchema),
  controller.acceptInvitation
);

//-------------------------------------------
// User | GroupInvitation #06 | Decline invitation
//-------------------------------------------
router.route('/:id/decline').post(
  auth(TRole.user),
  invitationLimiter,
  controller.declineInvitation
);

//-------------------------------------------
// Owner/Admin | GroupInvitation #07 | Cancel invitation
//-------------------------------------------
router.route('/:id/cancel').delete(
  auth(TRole.user),
  invitationLimiter,
  controller.cancelInvitation
);

//-------------------------------------------
// User | GroupInvitation #08 | Get my invitation count
//-------------------------------------------
router.route('/count').get(
  auth(TRole.user),
  invitationLimiter,
  validateFiltersForQuery(optionValidationChecking(['status'])),
  controller.getInvitationCount
);

export const GroupInvitationRoute = router;
