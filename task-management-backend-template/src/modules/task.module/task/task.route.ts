//@ts-ignore
import express from 'express';
import { TaskController } from './task.controller';
import { ITask } from './task.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import * as validation from './task.validation';
import { verifyTaskAccess, verifyTaskOwnership, validateTaskTypeConsistency, validateStatusTransition, checkDailyTaskLimit } from './task.middleware';
import { SubTaskRoute } from '../subtask/subTask.route';
import rateLimit from 'express-rate-limit';
import { TASK_RATE_LIMITS } from './task.constant';

const router = express.Router();

// ─── Rate Limiters ─────────────────────────────────────────────────────
/**
 * Rate limiter for creating tasks
 * Prevents spam and resource exhaustion
 */
const createTaskLimiter = rateLimit({
  windowMs: TASK_RATE_LIMITS.CREATE_TASK.windowMs,
  max: TASK_RATE_LIMITS.CREATE_TASK.max,
  message: {
    success: false,
    message: TASK_RATE_LIMITS.CREATE_TASK.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general task operations
 */
const taskLimiter = rateLimit({
  windowMs: TASK_RATE_LIMITS.GENERAL.windowMs,
  max: TASK_RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    message: TASK_RATE_LIMITS.GENERAL.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const optionValidationChecking = <T extends keyof ITask | 'sortBy' | 'page' | 'limit' | 'populate' | 'status' | 'taskType' | 'priority' | 'from' | 'to'>(
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

const controller = new TaskController();

/*-─────────────────────────────────
|  Child | Business | Task | edit-update-task-flow.png | Create a new task
|  @desc Create personal, single assignment, or collaborative task
|  @auth All authenticated users (child, business)
|  @rateLimit 20 requests per hour (prevents spam)
|  @permission Child users need explicit permission for group/collaborative tasks
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.commonUser),
  createTaskLimiter,
  validateRequest(validation.createTaskValidationSchema),
  validateTaskTypeConsistency,
  checkDailyTaskLimit,
  controller.create
);

/*-─────────────────────────────────
|  Child | Business | Task | home-flow.png | Get all my tasks with filtering
|  @desc Get tasks where user is creator, owner, or assigned
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/').get(
  auth(TRole.commonUser),
  taskLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'taskType', 'priority', 'from', 'to', ...paginationOptions])),
  controller.getMyTasks
);

/*-─────────────────────────────────
|  Child | Business | Task | home-flow.png | Get all my tasks with pagination
|  @desc Paginated list of tasks with advanced filtering
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/paginate').get(
  auth(TRole.commonUser),
  taskLimiter,
  validateFiltersForQuery(optionValidationChecking(['status', 'taskType', 'priority', 'from', 'to', ...paginationOptions])),
  setQueryOptions({
    populate: [
      { path: 'createdById', select: 'name email profileImage' },
      { path: 'ownerUserId', select: 'name email profileImage' },
      { path: 'assignedUserIds', select: 'name email profileImage' },
    ],
  }),
  controller.getMyTasksWithPagination
);

/*-─────────────────────────────────
|  Child | Business | Task | status-section-flow-01.png | Get task statistics
|  @desc Get count of tasks by status (pending, inProgress, completed)
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/statistics').get(
  auth(TRole.commonUser),
  taskLimiter,
  controller.getStatistics
);

/*-─────────────────────────────────
|  Child | Business | Task | home-flow.png | Get daily progress
|  @desc Get task completion progress for a specific date
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
└──────────────────────────────────*/
router.route('/daily-progress').get(
  auth(TRole.commonUser),
  taskLimiter,
  controller.getDailyProgress
);

/*-─────────────────────────────────
|  Child | Business | Task | task-details-with-subTasks.png | Get task details by ID
|  @desc Get single task with populated user details and subtasks
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
|  @access Task creator, owner, or assigned users only
└──────────────────────────────────*/
router.route('/:id').get(
  auth(TRole.commonUser),
  taskLimiter,
  verifyTaskAccess,
  setQueryOptions({
    populate: [
      { path: 'createdById', select: 'name email profileImage' },
      { path: 'ownerUserId', select: 'name email profileImage' },
      { path: 'assignedUserIds', select: 'name email profileImage' },
    ],
    select: '-__v'
  }),
  controller.getTaskById
);

/*-─────────────────────────────────
|  Child | Business | Task | edit-update-task-flow.png | Update task by ID
|  @desc Update task details (creator/owner only)
|  @auth All authenticated users (child, business)
|  @rateLimit 100 requests per minute
|  @access Task creator or owner only
└──────────────────────────────────*/
router.route('/:id').put(
  auth(TRole.commonUser),
  taskLimiter,
  verifyTaskAccess,
  verifyTaskOwnership,
  validateRequest(validation.updateTaskValidationSchema),
  validateTaskTypeConsistency,
  controller.updateById
);

/*-─────────────────────────────────
|  Child | Business | Task | edit-update-task-flow.png | Update task status
|  @desc Update task status with automatic timestamp handling
|  @auth All authenticated users (child, business)
|  @access Task creator, owner, or assigned users only
└──────────────────────────────────*/
router.route('/:id/status').put(
  auth(TRole.commonUser),
  verifyTaskAccess,
  verifyTaskOwnership,
  validateRequest(validation.updateTaskStatusValidationSchema),
  validateStatusTransition,
  controller.updateStatus
);

/*-─────────────────────────────────
|  Child | Business | Task | edit-update-task-flow.png | Update subtask progress
|  @desc Update subtask list and auto-calculate completion percentage
|  @auth All authenticated users (child, business)
|  @access Task creator or owner only
└──────────────────────────────────*/
router.route('/:id/subtasks/progress').put(
  auth(TRole.commonUser),
  verifyTaskAccess,
  verifyTaskOwnership,
  controller.updateSubtaskProgress
);

/*-─────────────────────────────────
|  Child | Business | Task | edit-update-task-flow.png | Soft delete task by ID
|  @desc Soft delete a task (creator/owner only)
|  @auth All authenticated users (child, business)
|  @access Task creator or owner only
└──────────────────────────────────*/
router.route('/:id').delete(
  auth(TRole.commonUser),
  verifyTaskAccess,
  verifyTaskOwnership,
  controller.softDeleteById
);

/*-─────────────────────────────────
|  Admin | Task | dashboard-section-flow.png | Permanently delete task by ID
|  @desc Permanently delete a task (admin only)
|  @auth Admin only
|  @access System administrators only
└──────────────────────────────────*/
router.route('/:id/permanent').delete(
  auth(TRole.admin),
  verifyTaskAccess,
  controller.deleteById
);

/*-─────────────────────────────────
|  SubTask Routes
|  @module SubTask
|  @desc Nested routes for subtask CRUD operations
|  @routes POST /tasks/:id/subtasks - Add subtask
|  @routes GET /tasks/:id/subtasks - Get all subtasks
|  @routes GET /tasks/:id/subtasks/:subtaskId - Get single subtask
|  @routes PUT /tasks/:id/subtasks/:subtaskId - Update subtask
|  @routes POST /tasks/:id/subtasks/:subtaskId/toggle - Toggle subtask
|  @routes DELETE /tasks/:id/subtasks/:subtaskId - Delete subtask
└──────────────────────────────────*/
router.use('/:id', SubTaskRoute);

// ────────────────────────────────────────────────────────────────────────
// Figma-Aligned Routes: Daily Progress
// Figma: app-user/group-children-user/home-flow.png
//        teacher-parent-dashboard/dashboard/dashboard-flow-01.png
// ────────────────────────────────────────────────────────────────────────

/*-─────────────────────────────────
|  Child | Business | Task | home-flow.png | Get daily progress (Figma aligned)
|  @desc Get daily task progress for dashboard display
|  @auth All authenticated users (child, business)
└──────────────────────────────────*/
router.route('/daily-progress').get(
  auth(TRole.commonUser),
  controller.getDailyProgress
);

export const TaskRoute = router;
