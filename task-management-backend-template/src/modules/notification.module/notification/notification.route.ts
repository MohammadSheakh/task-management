//@ts-ignore
import express from 'express';
import { NotificationController } from './notification.controller';
import { INotificationDocument } from './notification.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import rateLimit from 'express-rate-limit';
import validateRequest from '../../../shared/validateRequest';
import { z } from 'zod';

const router = express.Router();

export const optionValidationChecking = <T extends keyof INotificationDocument | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new NotificationController();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for sending notifications
 * Prevents spam
 */
const sendNotificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many notification attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general notification operations
 */
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validation Schemas ────────────────────────────────────────────────
/**
 * Bulk notification validation
 */
const sendBulkNotificationSchema = z.object({
  userIds: z.array(z.string()).optional(),
  receiverRole: z.string().optional(),
  title: z.union([z.string(), z.record(z.string())]),
  subTitle: z.union([z.string(), z.record(z.string())]).optional(),
  type: z.enum(['task', 'group', 'system', 'reminder', 'mention', 'assignment', 'deadline', 'custom']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  channels: z.array(z.enum(['in_app', 'email', 'push', 'sms'])).optional(),
  linkFor: z.string().optional(),
  linkId: z.string().optional(),
  data: z.record(z.any()).optional(),
}).refine(data => data.userIds || data.receiverRole, {
  message: 'UserIds or receiverRole is required',
});

/**
 * Schedule reminder validation
 */
const scheduleReminderSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  reminderTime: z.string().min(1, 'Reminder time is required'),
  reminderType: z.enum(['before_deadline', 'at_deadline', 'after_deadline', 'custom']).optional(),
  message: z.string().max(500).optional(),
});

// ─── Routes ────────────────────────────────────────────────────────────

//-------------------------------------------
// User | Notification #01 | Get my notifications with pagination
//-------------------------------------------
router.route('/my').get(
  auth(TRole.user),
  notificationLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'type', 'priority', ...paginationOptions])),
  controller.getMyNotifications
);

//-------------------------------------------
// User | Notification #02 | Get unread notification count
//-------------------------------------------
router.route('/unread-count').get(
  auth(TRole.user),
  notificationLimiter,
  controller.getUnreadCount
);

//-------------------------------------------
// User | Notification #03 | Mark notification as read
//-------------------------------------------
router.route('/:id/read').post(
  auth(TRole.user),
  notificationLimiter,
  controller.markAsRead
);

//-------------------------------------------
// User | Notification #04 | Mark all notifications as read
//-------------------------------------------
router.route('/read-all').post(
  auth(TRole.user),
  notificationLimiter,
  controller.markAllAsRead
);

//-------------------------------------------
// User | Notification #05 | Delete notification
//-------------------------------------------
router.route('/:id').delete(
  auth(TRole.user),
  notificationLimiter,
  controller.deleteNotification
);

//-------------------------------------------
// Admin | Notification #06 | Send bulk notification
//-------------------------------------------
router.route('/bulk').post(
  auth(TRole.admin, TRole.superAdmin),
  sendNotificationLimiter,
  validateRequest(sendBulkNotificationSchema),
  controller.sendBulkNotification
);

//-------------------------------------------
// User | Notification #07 | Schedule reminder
//-------------------------------------------
router.route('/schedule-reminder').post(
  auth(TRole.user),
  sendNotificationLimiter,
  validateRequest(scheduleReminderSchema),
  controller.scheduleReminder
);

export const NotificationRoute = router;
