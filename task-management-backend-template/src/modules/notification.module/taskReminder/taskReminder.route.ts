//@ts-ignore
import express from 'express';
import { TaskReminderController } from './taskReminder.controller';
import { ITaskReminderDocument } from './taskReminder.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import rateLimit from 'express-rate-limit';
import validateRequest from '../../../shared/validateRequest';
import { z } from 'zod';

const router = express.Router();

export const optionValidationChecking = <T extends keyof ITaskReminderDocument | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new TaskReminderController();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for creating reminders
 */
const createReminderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many reminder creation attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general reminder operations
 */
const reminderLimiter = rateLimit({
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
 * Create reminder validation
 */
const createReminderSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  reminderTime: z.string().min(1, 'Reminder time is required'),
  triggerType: z.enum(['before_deadline', 'at_deadline', 'after_deadline', 'custom_time', 'recurring']).optional(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).optional(),
  customMessage: z.string().max(500).optional(),
  channels: z.array(z.enum(['in_app', 'email', 'push', 'sms'])).optional(),
});

// ─── Routes ────────────────────────────────────────────────────────────

//-------------------------------------------
// User | TaskReminder #01 | Create task reminder
//-------------------------------------------
router.route('/').post(
  auth(TRole.user),
  createReminderLimiter,
  validateRequest(createReminderSchema),
  controller.createReminder
);

//-------------------------------------------
// User | TaskReminder #02 | Get reminders for a task
//-------------------------------------------
router.route('/task/:id').get(
  auth(TRole.user),
  reminderLimiter,
  validateFiltersForQuery(optionValidationChecking([...paginationOptions])),
  controller.getRemindersForTask
);

//-------------------------------------------
// User | TaskReminder #03 | Get my reminders
//-------------------------------------------
router.route('/my').get(
  auth(TRole.user),
  reminderLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'frequency', ...paginationOptions])),
  controller.getMyReminders
);

//-------------------------------------------
// User | TaskReminder #04 | Cancel a reminder
//-------------------------------------------
router.route('/:id').delete(
  auth(TRole.user),
  reminderLimiter,
  controller.cancelReminder
);

//-------------------------------------------
// User | TaskReminder #05 | Cancel all reminders for a task
//-------------------------------------------
router.route('/task/:id/cancel-all').post(
  auth(TRole.user),
  reminderLimiter,
  controller.cancelAllReminders
);

export const TaskReminderRoute = router;
