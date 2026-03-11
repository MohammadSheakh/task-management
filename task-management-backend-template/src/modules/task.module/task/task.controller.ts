import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { Task } from './task.model';
import { ITask } from './task.interface';
import { TaskService } from './task.service';
import { TRole } from '../../../middlewares/roles';
import ApiError from '../../../errors/ApiError';
import { GroupMember } from '../../group.module/groupMember/groupMember.model';
import { SubTaskService } from '../subtask/subTask.service';

/**
 * Task Controller
 * Handles HTTP requests for task operations
 * Extends GenericController for standard CRUD operations
 */
export class TaskController extends GenericController<typeof Task, ITask> {
  taskService: TaskService;
  subTaskService: SubTaskService;

  constructor() {
    super(new TaskService(), 'Task');
    this.taskService = new TaskService();
    this.subTaskService = new SubTaskService();
  }

  /**
   * Create a new task
   * Overrides generic create to add user context
   * Includes permission check for group/collaborative tasks
   */
  create = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const taskData = req.body;

    // ────────────────────────────────────────────────────────────────────────
    // Permission Check for Group/Collaborative Tasks
    // ────────────────────────────────────────────────────────────────────────
    // If task is for a group or is collaborative, check if user has permission
    if (taskData.groupId || taskData.taskType === 'collaborative') {
      const groupId = taskData.groupId;

      if (groupId) {
        // Check if user has permission to create tasks in this group
        const canCreate = await GroupMember.canCreateTasks(groupId, userId);

        if (!canCreate) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            'You do not have permission to create tasks for this group. Please contact the group owner to request access.'
          );
        }
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    const result = await this.taskService.createTask(taskData, userId);

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: 'Task created successfully',
      success: true,
    });
  };

  /**
   * Get all tasks for the logged-in user
   * Supports filtering by status, type, priority, and date range
   */
  getMyTasks = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const filters = req.query;
    const result = await this.taskService.getUserTasks(userId, filters);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Tasks retrieved successfully',
      success: true,
    });
  };

  /**
   * Get all tasks for the logged-in user with pagination
   */
  getMyTasksWithPagination = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const filters = req.query;
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string || '-startTime',
    };

    const result = await this.taskService.getUserTasksWithPagination(
      userId,
      filters,
      options
    );

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Tasks retrieved successfully with pagination',
      success: true,
    });
  };

  /**
   * Get task statistics for the logged-in user
   */
  getStatistics = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.taskService.getTaskStatistics(userId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Task statistics retrieved successfully',
      success: true,
    });
  };

  /**
   * Get daily progress for a specific date
   */
  getDailyProgress = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const result = await this.taskService.getDailyProgress(userId, date);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Daily progress retrieved successfully',
      success: true,
    });
  };

  /**
   * Update task status
   * Specialized endpoint for status changes
   */
  updateStatus = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { status, completedTime } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (!status) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Status is required');
    }

    const result = await this.taskService.updateTaskStatus(taskId, status, userId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Task status updated successfully',
      success: true,
    });
  };

  /**
   * Update subtask progress
   * Automatically recalculates completion percentage
   */
  updateSubtaskProgress = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { subtasks } = req.body;

    if (!subtasks || !Array.isArray(subtasks)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subtasks array is required');
    }

    const result = await this.taskService.updateSubtaskProgress(taskId, subtasks);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask progress updated successfully',
      success: true,
    });
  };

  /**
   * Get a single task by ID with ownership validation
   * Includes populated subtasks for Flutter
   */
  getTaskById = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    // Use the generic getById with proper population
    const populateOptions = [
      { path: 'createdById', select: 'name email profileImage' },
      { path: 'ownerUserId', select: 'name email profileImage' },
      { path: 'assignedUserIds', select: 'name email profileImage' },
      { 
        path: 'subtasks', 
        select: 'title isCompleted duration completedAt',
        options: { sort: { order: 1 } }
      },
    ];

    const select = '-__v';
    const result = await this.service.getById(taskId, populateOptions, select);

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    // Verify user has access to this task
    const hasAccess =
      result.createdById.toString() === userId ||
      result.ownerUserId?.toString() === userId ||
      (result.assignedUserIds || []).some((id: any) => id.toString() === userId);

    if (!hasAccess) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have access to this task');
    }

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Task retrieved successfully',
      success: true,
    });
  };

  // ─── SubTask Handlers (delegated to SubTaskService) ───────────────────────────

  /**
   * Add a subtask to a task
   * User | SubTask #01 | Add subtask
   */
  addSubtask = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { title, duration } = req.body;

    const result = await this.subTaskService.addSubtask(taskId, { title, duration });

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: 'Subtask added successfully',
      success: true,
    });
  };

  /**
   * Get all subtasks for a task
   * User | SubTask #02 | Get all subtasks
   */
  getSubtasksForTask = async (req: Request, res: Response) => {
    const taskId = req.params.id;

    const result = await this.subTaskService.getSubtasksForTask(taskId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtasks retrieved successfully',
      success: true,
    });
  };

  /**
   * Get a single subtask
   * User | SubTask #03 | Get subtask details
   */
  getSubtask = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const subtaskId = req.params.subtaskId;

    const result = await this.subTaskService.getSubtask(taskId, subtaskId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask retrieved successfully',
      success: true,
    });
  };

  /**
   * Update a subtask
   * User | SubTask #04 | Update subtask
   */
  updateSubtask = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const subtaskId = req.params.subtaskId;
    const updateData = req.body;

    const result = await this.subTaskService.updateSubtask(taskId, subtaskId, updateData);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask updated successfully',
      success: true,
    });
  };

  /**
   * Toggle subtask completion
   * User | SubTask #05 | Toggle subtask status
   */
  toggleSubtask = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const subtaskId = req.params.subtaskId;

    const result = await this.subTaskService.toggleSubtask(taskId, subtaskId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: result.isCompleted 
        ? 'Subtask marked as completed' 
        : 'Subtask marked as incomplete',
      success: true,
    });
  };

  /**
   * Delete a subtask
   * User | SubTask #06 | Delete subtask
   */
  deleteSubtask = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const subtaskId = req.params.subtaskId;

    const result = await this.subTaskService.deleteSubtask(taskId, subtaskId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask deleted successfully',
      success: true,
    });
  };

  /**
   * Bulk update subtasks (replaces entire list)
   * User | SubTask #07 | Bulk update subtasks
   */
  bulkUpdateSubtasks = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { subtasks } = req.body;

    const result = await this.subTaskService.bulkUpdateSubtasks(taskId, subtasks);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: {
        subtasks: result.subtasks,
        totalSubtasks: result.totalSubtasks,
        completedSubtasks: result.completedSubtasks,
      },
      message: 'Subtasks updated successfully',
      success: true,
    });
  };

  // ────────────────────────────────────────────────────────────────────────
  // Figma-Aligned Controllers: Daily Progress
  // ────────────────────────────────────────────────────────────────────────

  /** ----------------------------------------------
   * @role User (Primary/Secondary)
   * @Section Home
   * @module Task
   * @figmaIndex 01
   * @desc Get daily progress (Figma: home-flow.png)
   *----------------------------------------------*/
  getDailyProgress = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    const result = await this.taskService.getDailyProgress(userId, date);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Daily progress retrieved successfully',
      success: true,
    });
  };
}
