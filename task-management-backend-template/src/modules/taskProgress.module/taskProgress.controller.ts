//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { CatchAsync } from '../../../shared/catchAsync';
import { SuccessResponse } from '../../../shared/SuccessResponse';
import { taskProgressService } from './taskProgress.service';
import { TASK_PROGRESS_STATUS } from './taskProgress.constant';

/**
 * Task Progress Controller
 * Handles HTTP requests for task progress operations
 * 
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class TaskProgressController {
  /**
   * Get progress for a specific task and user
   * GET /task-progress/:taskId/user/:userId
   */
  getProgress = CatchAsync(async (req: any, res: any) => {
    const { taskId } = req.params;
    const userId = (req as any).user.userId;

    const result = await taskProgressService.getProgress(taskId, userId);

    new SuccessResponse(
      StatusCodes.OK,
      'Progress retrieved successfully',
      result
    ).send(res);
  });

  /**
   * Get all children's progress for a task (Parent Dashboard)
   * GET /task-progress/:taskId/children
   */
  getAllChildrenProgress = CatchAsync(async (req: any, res: any) => {
    const { taskId } = req.params;

    const result = await taskProgressService.getAllChildrenProgress(taskId);

    new SuccessResponse(
      StatusCodes.OK,
      'Children progress retrieved successfully',
      result
    ).send(res);
  });

  /**
   * Get all tasks progress for a child
   * GET /task-progress/child/:childId/tasks
   */
  getAllTasksProgress = CatchAsync(async (req: any, res: any) => {
    const { childId } = req.params;
    const { status, taskType } = req.query;

    const result = await taskProgressService.getAllTasksProgress(childId, { status, taskType });

    new SuccessResponse(
      StatusCodes.OK,
      'Tasks progress retrieved successfully',
      result
    ).send(res);
  });

  /**
   * Update progress status (start/complete task)
   * PUT /task-progress/:taskId/status
   */
  updateProgressStatus = CatchAsync(async (req: any, res: any) => {
    const { taskId } = req.params;
    const userId = (req as any).user.userId;
    const { status, note } = req.body;

    const result = await taskProgressService.updateProgressStatus(taskId, userId, status, note);

    new SuccessResponse(
      StatusCodes.OK,
      `Task ${status} successfully`,
      result
    ).send(res);
  });

  /**
   * Mark a subtask as complete
   * PUT /task-progress/:taskId/subtasks/:subtaskIndex/complete
   */
  completeSubtask = CatchAsync(async (req: any, res: any) => {
    const { taskId, subtaskIndex } = req.params;
    const userId = (req as any).user.userId;

    const result = await taskProgressService.completeSubtask(taskId, parseInt(subtaskIndex), userId);

    new SuccessResponse(
      StatusCodes.OK,
      'Subtask completed successfully',
      result
    ).send(res);
  });

  /**
   * Create or update progress (internal use)
   * POST /task-progress/:taskId
   */
  createOrUpdateProgress = CatchAsync(async (req: any, res: any) => {
    const { taskId } = req.params;
    const { userId, status } = req.body;

    const result = await taskProgressService.createOrUpdateProgress(taskId, userId, status);

    new SuccessResponse(
      StatusCodes.CREATED,
      'Progress created successfully',
      result
    ).send(res);
  });
}

export const taskProgressController = new TaskProgressController();
