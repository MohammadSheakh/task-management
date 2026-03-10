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

/*-─────────────────────────────────
|  Child | Business | Notification | home-flow.png | Get my notifications with pagination
|  @desc User retrieves their personal notifications
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/my').get(
  auth(TRole.commonUser),
  notificationLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'type', 'priority', ...paginationOptions])),
  controller.getMyNotifications
);

/*-─────────────────────────────────
|  Child | Business | Notification | home-flow.png | Get unread notification count
|  @desc Get count of unread notifications for badge display
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/unread-count').get(
  auth(TRole.commonUser),
  notificationLimiter,
  controller.getUnreadCount
);

/*-─────────────────────────────────
|  Child | Business | Notification | home-flow.png | Mark notification as read
|  @desc Mark a single notification as read
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id/read').post(
  auth(TRole.commonUser),
  notificationLimiter,
  controller.markAsRead
);

/*-─────────────────────────────────
|  Child | Business | Notification | home-flow.png | Mark all notifications as read
|  @desc Mark all user notifications as read
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/read-all').post(
  auth(TRole.commonUser),
  notificationLimiter,
  controller.markAllAsRead
);

/*-─────────────────────────────────
|  Child | Business | Notification | home-flow.png | Delete notification
|  @desc Delete a single notification
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/:id').delete(
  auth(TRole.commonUser),
  notificationLimiter,
  controller.deleteNotification
);

/*-─────────────────────────────────
|  Admin | Notification | dashboard-section-flow.png | Send bulk notification
|  @desc Admin sends system-wide or targeted notifications
|  @auth Admin only
|  @rateLimit 10 requests per minute
└──────────────────────────────────*/
router.route('/bulk').post(
  auth(TRole.admin),
  sendNotificationLimiter,
  validateRequest(sendBulkNotificationSchema),
  controller.sendBulkNotification
);

/*-─────────────────────────────────
|  Child | Business | Notification | home-flow.png | Schedule reminder
|  @desc User schedules a task reminder
|  @auth All authenticated users (child, business)
|  @rateLimit 10 requests per minute
└──────────────────────────────────*/
router.route('/schedule-reminder').post(
  auth(TRole.commonUser),
  sendNotificationLimiter,
  validateRequest(scheduleReminderSchema),
  controller.scheduleReminder
);

// ────────────────────────────────────────────────────────────────────────
// Figma-Aligned Routes: Live Activity Feed
// Figma: teacher-parent-dashboard/dashboard/dashboard-flow-01.png
//        app-user/group-children-user/home-flow.png
// ────────────────────────────────────────────────────────────────────────

/*-─────────────────────────────────
|  Child | Business | Notification | dashboard-flow-01.png | Get live activity feed for group
|  @desc Real-time feed of group member task completions and activities
|  @auth Group members (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/activity-feed/:groupId').get(
  auth(TRole.commonUser),
  notificationLimiter,
  controller.getLiveActivityFeed
);

export const NotificationRoute = router;
