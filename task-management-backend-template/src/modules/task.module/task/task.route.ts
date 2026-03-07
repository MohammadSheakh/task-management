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
import { SubTaskRoute } from '../subtask/subtask.route';

const router = express.Router();

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
|  User | 01-01 | Create a new task
|  @module Task
|  @figmaIndex 01-01
|  @desc Create personal, single assignment, or collaborative task
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.commonUser),
  validateRequest(validation.createTaskValidationSchema),
  validateTaskTypeConsistency,
  checkDailyTaskLimit,
  controller.create
);

/*-─────────────────────────────────
|  User | 01-02 | Get all my tasks with filtering
|  @module Task
|  @figmaIndex 01-02
|  @desc Get tasks where user is creator, owner, or assigned
└──────────────────────────────────*/
router.route('/').get(
  auth(TRole.commonUser),
  validateFiltersForQuery(optionValidationChecking(['status', 'taskType', 'priority', 'from', 'to', ...paginationOptions])),
  controller.getMyTasks
);

/*-─────────────────────────────────
|  User | 01-03 | Get all my tasks with pagination
|  @module Task
|  @figmaIndex 01-03
|  @desc Paginated list of tasks with advanced filtering
└──────────────────────────────────*/
router.route('/paginate').get(
  auth(TRole.commonUser),
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
|  User | 01-04 | Get task statistics
|  @module Task
|  @figmaIndex 01-04
|  @desc Get count of tasks by status (pending, inProgress, completed)
└──────────────────────────────────*/
router.route('/statistics').get(
  auth(TRole.commonUser),
  controller.getStatistics
);

/*-─────────────────────────────────
|  User | 01-05 | Get daily progress
|  @module Task
|  @figmaIndex 01-05
|  @desc Get task completion progress for a specific date
└──────────────────────────────────*/
router.route('/daily-progress').get(
  auth(TRole.commonUser),
  controller.getDailyProgress
);

/*-─────────────────────────────────
|  User | 01-06 | Get task details by ID
|  @module Task
|  @figmaIndex 01-06
|  @desc Get single task with populated user details
└──────────────────────────────────*/
router.route('/:id').get(
  auth(TRole.commonUser),
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
|  User | 01-07 | Update task by ID
|  @module Task
|  @figmaIndex 01-07
|  @desc Update task details (creator/owner only)
└──────────────────────────────────*/
router.route('/:id').put(
  auth(TRole.commonUser),
  verifyTaskAccess,
  verifyTaskOwnership,
  validateRequest(validation.updateTaskValidationSchema),
  validateTaskTypeConsistency,
  controller.updateById
);

/*-─────────────────────────────────
|  User | 01-08 | Update task status
|  @module Task
|  @figmaIndex 01-08
|  @desc Update task status with automatic timestamp handling
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
|  User | 01-09 | Update subtask progress
|  @module Task
|  @figmaIndex 01-09
|  @desc Update subtask list and auto-calculate completion
└──────────────────────────────────*/
router.route('/:id/subtasks/progress').put(
  auth(TRole.commonUser),
  verifyTaskAccess,
  verifyTaskOwnership,
  controller.updateSubtaskProgress
);

/*-─────────────────────────────────
|  User | 01-10 | Soft delete task by ID
|  @module Task
|  @figmaIndex 01-10
|  @desc Soft delete a task (creator/owner only)
└──────────────────────────────────*/
router.route('/:id').delete(
  auth(TRole.commonUser),
  verifyTaskAccess,
  verifyTaskOwnership,
  controller.softDeleteById
);

/*-─────────────────────────────────
|  User | 01-11 | Permanently delete task by ID
|  @module Task
|  @figmaIndex 01-11
|  @desc Permanently delete a task (admin only)
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
// ────────────────────────────────────────────────────────────────────────

/*-─────────────────────────────────
|  User | 01-12 | Get daily progress
|  @module Task
|  @figmaIndex 01
|  @desc Get daily task progress (Figma: home-flow.png)
└──────────────────────────────────*/
router.route('/daily-progress').get(
  auth(TRole.commonUser),
  controller.getDailyProgress
);

export const TaskRoute = router;
