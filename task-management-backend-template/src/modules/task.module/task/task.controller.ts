import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { Task } from './task.model';
import { ITask } from './task.interface';
import { TaskService } from './task.service';
import { TRole } from '../../../middlewares/roles';
import ApiError from '../../../errors/ApiError';

/**
 * Task Controller
 * Handles HTTP requests for task operations
 * Extends GenericController for standard CRUD operations
 */
export class TaskController extends GenericController<typeof Task, ITask> {
  taskService: TaskService;

  constructor() {
    super(new TaskService(), 'Task');
    this.taskService = new TaskService();
  }

  /**
   * Create a new task
   * Overrides generic create to add user context
   */
  create = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const taskData = req.body;
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
}
