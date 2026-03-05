import { StatusCodes } from 'http-status-codes';
import { Task } from './task.model';
import { ITask } from './task.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { Types } from 'mongoose';
import { DAILY_TASK_LIMIT, TTaskStatus } from './task.constant';

/**
 * Task Service
 * Handles business logic for task operations
 * Extends GenericService for CRUD operations
 */
export class TaskService extends GenericService<typeof Task, ITask> {
  constructor() {
    super(Task);
  }

  /**
   * Create a new task with daily limit validation
   * @param data - Task data
   * @param userId - ID of the user creating the task
   * @returns Created task
   */
  async createTask(data: Partial<ITask>, userId: Types.ObjectId): Promise<ITask> {
    // Validate daily task limit for personal tasks
    if (data.taskType === 'personal' && data.startTime) {
      const startDate = new Date(data.startTime);
      startDate.setHours(0, 0, 0, 0);

      const existingTaskCount = await this.model.countDocuments({
        ownerUserId: userId,
        startTime: {
          $gte: startDate,
          $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
        },
        isDeleted: false,
      });

      if (existingTaskCount >= DAILY_TASK_LIMIT.max) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `You can only create ${DAILY_TASK_LIMIT.max} tasks per day. You already have ${existingTaskCount} tasks scheduled for this day.`
        );
      }
    }

    // Auto-set ownerUserId for personal tasks
    if (data.taskType === 'personal' && !data.ownerUserId) {
      data.ownerUserId = userId;
    }

    // Auto-calculate subtask counts if subtasks are provided
    if ((data as any).subtasks && Array.isArray((data as any).subtasks)) {
      data.totalSubtasks = (data as any).subtasks.length;
      data.completedSubtasks = (data as any).subtasks.filter(
        (st: any) => st.isCompleted
      ).length;
    }

    const task = await this.model.create({
      ...data,
      createdById: userId,
    });

    return task;
  }

  /**
   * Get tasks for a user with filtering
   * @param userId - User ID
   * @param filters - Query filters
   * @returns Array of tasks
   */
  async getUserTasks(
    userId: Types.ObjectId,
    filters: any
  ): Promise<ITask[]> {
    const query: any = {
      isDeleted: false,
      $or: [
        { ownerUserId: userId },
        { assignedUserIds: userId },
        { createdById: userId },
      ],
    };

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply task type filter
    if (filters.taskType) {
      query.taskType = filters.taskType;
    }

    // Apply priority filter
    if (filters.priority) {
      query.priority = filters.priority;
    }

    // Apply date range filter
    if (filters.from || filters.to) {
      query.startTime = {};
      if (filters.from) {
        query.startTime.$gte = new Date(filters.from);
      }
      if (filters.to) {
        query.startTime.$lte = new Date(filters.to);
      }
    }

    const tasks = await this.model.find(query).select('-__v').sort({ startTime: -1 });

    return tasks;
  }

  /**
   * Get tasks with pagination and advanced filtering
   * @param userId - User ID
   * @param filters - Query filters
   * @param options - Pagination options
   * @returns Paginated tasks
   */
  async getUserTasksWithPagination(
    userId: Types.ObjectId,
    filters: any,
    options: any
  ) {
    const query: any = {
      isDeleted: false,
      $or: [
        { ownerUserId: userId },
        { assignedUserIds: userId },
        { createdById: userId },
      ],
    };

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.taskType) query.taskType = filters.taskType;
    if (filters.priority) query.priority = filters.priority;

    // Date range filter
    if (filters.from || filters.to) {
      query.startTime = {};
      if (filters.from) query.startTime.$gte = new Date(filters.from);
      if (filters.to) query.startTime.$lte = new Date(filters.to);
    }

    const result = await this.model.paginate(query, options);
    return result;
  }

  /**
   * Update task status with automatic timestamp handling
   * @param taskId - Task ID
   * @param status - New status
   * @param userId - User performing the update
   * @returns Updated task
   */
  async updateTaskStatus(
    taskId: string,
    status: TTaskStatus,
    userId: Types.ObjectId
  ): Promise<ITask> {
    const updateData: any = { status };

    // Auto-set completedTime when status changes to completed
    if (status === TTaskStatus.completed) {
      updateData.completedTime = new Date();
    }

    const updatedTask = await this.model.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    ).select('-__v');

    if (!updatedTask) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    return updatedTask;
  }

  /**
   * Update subtask progress and recalculate completion
   * @param taskId - Task ID
   * @param subtaskUpdates - Array of subtask updates
   * @returns Updated task
   */
  async updateSubtaskProgress(
    taskId: string,
    subtaskUpdates: Array<{ isCompleted: boolean }>
  ): Promise<ITask> {
    const totalSubtasks = subtaskUpdates.length;
    const completedSubtasks = subtaskUpdates.filter(st => st.isCompleted).length;

    const updateData: any = {
      totalSubtasks,
      completedSubtasks,
    };

    // Auto-complete task if all subtasks are done
    if (totalSubtasks > 0 && completedSubtasks === totalSubtasks) {
      updateData.status = TTaskStatus.completed;
      updateData.completedTime = new Date();
    }

    const updatedTask = await this.model.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    ).select('-__v');

    if (!updatedTask) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    return updatedTask;
  }

  /**
   * Get task statistics for a user
   * @param userId - User ID
   * @returns Task statistics
   */
  async getTaskStatistics(userId: Types.ObjectId) {
    const stats = await this.model.aggregate([
      {
        $match: {
          $or: [
            { ownerUserId: userId },
            { assignedUserIds: userId },
          ],
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    stats.forEach((stat) => {
      result[stat._id as keyof typeof result] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  /**
   * Get daily progress for a user
   * @param userId - User ID
   * @param date - Date to check
   * @returns Daily progress info
   */
  async getDailyProgress(userId: Types.ObjectId, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await this.model.find({
      ownerUserId: userId,
      startTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isDeleted: false,
    });

    const completedTasks = tasks.filter(t => t.status === TTaskStatus.completed).length;

    return {
      date,
      totalTasks: tasks.length,
      completedTasks,
      remainingTasks: tasks.length - completedTasks,
      completionPercentage: tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0,
    };
  }
}
