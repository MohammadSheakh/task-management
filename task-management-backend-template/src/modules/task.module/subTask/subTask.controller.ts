import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { SubTask } from './subTask.model';
import { ISubTask } from './subTask.interface';
import { SubTaskService } from './subTask.service';
import ApiError from '../../../errors/ApiError';

/**
 * SubTask Controller
 * Handles HTTP requests for subtask operations
 */
export class SubTaskController extends GenericController<typeof SubTask, ISubTask> {
  subTaskService: SubTaskService;

  constructor() {
    super(new SubTaskService(), 'SubTask');
    this.subTaskService = new SubTaskService();
  }

  /**
   * Create a new subtask
   */
  create = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const subTaskData = req.body;
    const result = await this.subTaskService.createSubTask(subTaskData, userId);

    (res as any).sendResponse({
      code: StatusCodes.CREATED,
      data: result,
      message: 'Subtask created successfully',
      success: true,
    });
  };

  /**
   * Get all subtasks for a specific task
   */
  getSubTasksByTask = async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const filters = req.query;

    const result = await this.subTaskService.getSubTasksByTaskId(taskId, filters);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtasks retrieved successfully',
      success: true,
    });
  };

  /**
   * Get subtasks with pagination
   */
  getSubTasksWithPagination = async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const filters = req.query;
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string || 'order',
    };

    const result = await this.subTaskService.getSubTasksWithPagination(
      taskId,
      filters,
      options
    );

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtasks retrieved successfully with pagination',
      success: true,
    });
  };

  /**
   * Toggle subtask completion status
   */
  toggleStatus = async (req: Request, res: Response) => {
    const subtaskId = req.params.id;
    const { isCompleted } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (isCompleted === undefined) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'isCompleted status is required');
    }

    const result = await this.subTaskService.toggleSubTaskStatus(
      subtaskId,
      isCompleted,
      userId
    );

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask status updated successfully',
      success: true,
    });
  };

  /**
   * Get subtask statistics for the logged-in user
   */
  getStatistics = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.subTaskService.getUserSubTaskStatistics(userId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask statistics retrieved successfully',
      success: true,
    });
  };

  /**
   * Update a subtask
   * Overrides generic update to handle parent task updates
   */
  updateById = async (req: Request, res: Response) => {
    const subtaskId = req.params.id;
    const updateData = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.subTaskService.updateSubTask(subtaskId, updateData);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask updated successfully',
      success: true,
    });
  };

  /**
   * Delete a subtask
   */
  deleteById = async (req: Request, res: Response) => {
    const subtaskId = req.params.id;

    const result = await this.subTaskService.deleteSubTask(subtaskId);

    (res as any).sendResponse({
      code: StatusCodes.OK,
      data: result,
      message: 'Subtask deleted successfully',
      success: true,
    });
  };
}
