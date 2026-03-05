//@ts-ignore
import express from 'express';
import { SubTaskController } from './subTask.controller';
import { ISubTask } from './subTask.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import * as validation from './subTask.validation';

const router = express.Router();

export const optionValidationChecking = <T extends keyof ISubTask | 'sortBy' | 'page' | 'limit' | 'populate' | 'taskId' | 'isCompleted'>(
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

const controller = new SubTaskController();

/*-─────────────────────────────────
|  User | 02-01 | Create a new subtask
|  @module SubTask
|  @figmaIndex 02-01
|  @desc Create a subtask under a parent task
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.commonUser),
  validateRequest(validation.createSubTaskValidationSchema),
  controller.create
);

/*-─────────────────────────────────
|  User | 02-02 | Get all subtasks for a task
|  @module SubTask
|  @figmaIndex 02-02
|  @desc Get all subtasks belonging to a specific task
└──────────────────────────────────*/
router.route('/task/:taskId').get(
  auth(TRole.commonUser),
  validateFiltersForQuery(optionValidationChecking(['isCompleted', ...paginationOptions])),
  setQueryOptions({
    populate: [
      { path: 'createdById', select: 'name email' },
      { path: 'assignedToUserId', select: 'name email' },
    ],
    select: '-__v'
  }),
  controller.getSubTasksByTask
);

/*-─────────────────────────────────
|  User | 02-03 | Get subtasks with pagination
|  @module SubTask
|  @figmaIndex 02-03
|  @desc Paginated list of subtasks for a task
└──────────────────────────────────*/
router.route('/task/:taskId/paginate').get(
  auth(TRole.commonUser),
  validateFiltersForQuery(optionValidationChecking(['isCompleted', ...paginationOptions])),
  setQueryOptions({
    populate: [
      { path: 'createdById', select: 'name email' },
      { path: 'assignedToUserId', select: 'name email' },
    ],
  }),
  controller.getSubTasksWithPagination
);

/*-─────────────────────────────────
|  User | 02-04 | Get subtask statistics
|  @module SubTask
|  @figmaIndex 02-04
|  @desc Get subtask completion statistics for logged-in user
└──────────────────────────────────*/
router.route('/statistics').get(
  auth(TRole.commonUser),
  controller.getStatistics
);

/*-─────────────────────────────────
|  User | 02-05 | Get subtask by ID
|  @module SubTask
|  @figmaIndex 02-05
|  @desc Get single subtask details
└──────────────────────────────────*/
router.route('/:id').get(
  auth(TRole.commonUser),
  setQueryOptions({
    populate: [
      { path: 'createdById', select: 'name email' },
      { path: 'assignedToUserId', select: 'name email' },
      { path: 'taskId', select: 'title status' },
    ],
    select: '-__v'
  }),
  controller.getByIdV2
);

/*-─────────────────────────────────
|  User | 02-06 | Update subtask by ID
|  @module SubTask
|  @figmaIndex 02-06
|  @desc Update subtask details
└──────────────────────────────────*/
router.route('/:id').put(
  auth(TRole.commonUser),
  validateRequest(validation.updateSubTaskValidationSchema),
  controller.updateById
);

/*-─────────────────────────────────
|  User | 02-07 | Toggle subtask status
|  @module SubTask
|  @figmaIndex 02-07
|  @desc Toggle subtask completion status (auto-updates parent task)
└──────────────────────────────────*/
router.route('/:id/toggle-status').put(
  auth(TRole.commonUser),
  validateRequest(validation.toggleSubTaskStatusValidationSchema),
  controller.toggleStatus
);

/*-─────────────────────────────────
|  User | 02-08 | Delete subtask by ID
|  @module SubTask
|  @figmaIndex 02-08
|  @desc Delete a subtask (auto-updates parent task)
└──────────────────────────────────*/
router.route('/:id').delete(
  auth(TRole.commonUser),
  controller.deleteById
);

export const SubTaskRoute = router;
