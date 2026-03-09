//@ts-ignore
import express from 'express';
import { taskProgressController } from './taskProgress.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import * as validation from './taskProgress.validation';
import rateLimit from 'express-rate-limit';
import { TASK_PROGRESS_RATE_LIMITS } from './taskProgress.constant';

const router = express.Router();

// ─── Rate Limiters ─────────────────────────────────────────────────────
const progressLimiter = rateLimit({
  windowMs: TASK_PROGRESS_RATE_LIMITS.GENERAL.windowMs,
  max: TASK_PROGRESS_RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    message: TASK_PROGRESS_RATE_LIMITS.GENERAL.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const updateProgressLimiter = rateLimit({
  windowMs: TASK_PROGRESS_RATE_LIMITS.UPDATE_PROGRESS.windowMs,
  max: TASK_PROGRESS_RATE_LIMITS.UPDATE_PROGRESS.max,
  message: {
    success: false,
    message: TASK_PROGRESS_RATE_LIMITS.UPDATE_PROGRESS.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/*-─────────────────────────────────
|  Child | 01-01 | Get my progress on a task
|  Role: Child User | Module: TaskProgress
|  Action: Get personal progress on specific task
|  Auth: Required
|  Rate Limit: 100 requests per minute
└──────────────────────────────────*/
router.get(
  '/:taskId/user/:userId',
  auth(TRole.commonUser),
  progressLimiter,
  taskProgressController.getProgress
);

/*-─────────────────────────────────
|  Parent | 01-02 | Get all children's progress on a task
|  Role: Business User | Module: TaskProgress
|  Action: View which children completed/started/not started
|  Auth: Required
|  Rate Limit: 100 requests per minute
|  Figma: task-details-with-subTasks.png
└──────────────────────────────────*/
router.get(
  '/:taskId/children',
  auth(TRole.commonUser),
  progressLimiter,
  taskProgressController.getAllChildrenProgress
);

/*-─────────────────────────────────
|  Parent | 01-03 | Get all tasks progress for a child
|  Role: Business User | Module: TaskProgress
|  Action: View child's overall task performance
|  Auth: Required
|  Rate Limit: 100 requests per minute
|  Figma: team-member-flow-01.png
└──────────────────────────────────*/
router.get(
  '/child/:childId/tasks',
  auth(TRole.commonUser),
  progressLimiter,
  taskProgressController.getAllTasksProgress
);

/*-─────────────────────────────────
|  Child | 01-04 | Update progress status (start/complete)
|  Role: Child User | Module: TaskProgress
|  Action: Mark task as started or completed
|  Auth: Required
|  Rate Limit: 30 requests per minute
└──────────────────────────────────*/
router.put(
  '/:taskId/status',
  auth(TRole.commonUser),
  updateProgressLimiter,
  validateRequest(validation.updateTaskProgressValidationSchema),
  taskProgressController.updateProgressStatus
);

/*-─────────────────────────────────
|  Child | 01-05 | Mark subtask as complete
|  Role: Child User | Module: TaskProgress
|  Action: Complete a specific subtask
|  Auth: Required
|  Rate Limit: 30 requests per minute
└──────────────────────────────────*/
router.put(
  '/:taskId/subtasks/:subtaskIndex/complete',
  auth(TRole.commonUser),
  updateProgressLimiter,
  validateRequest(validation.completeSubtaskValidationSchema),
  taskProgressController.completeSubtask
);

/*-─────────────────────────────────
|  System | 01-06 | Create or update progress (internal)
|  Role: System | Module: TaskProgress
|  Action: Auto-create progress when child assigned to task
|  Auth: Required
|  Rate Limit: 100 requests per minute
└──────────────────────────────────*/
router.post(
  '/:taskId',
  auth(TRole.commonUser),
  progressLimiter,
  validateRequest(validation.createTaskProgressValidationSchema),
  taskProgressController.createOrUpdateProgress
);

export const TaskProgressRoute = router;
