import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

/**
 * SubTask Interface
 * Represents a subtask within a task
 */
export interface ISubTask {
  _id?: Types.ObjectId;

  /** Parent task ID */
  taskId: Types.ObjectId;

  /** User who created this subtask */
  createdById: Types.ObjectId;

  /** User assigned to this subtask (optional) */
  assignedToUserId?: Types.ObjectId;

  /** Title of the subtask */
  title: string;

  /** Detailed description */
  description?: string;

  /** Estimated duration (e.g., "10 min", "1 hour") */
  duration?: string;

  /** Whether the subtask is completed */
  isCompleted: boolean;

  /** When the subtask was completed */
  completedAt?: Date;

  /** Sort order for subtasks */
  order?: number;

  /** Soft delete flag */
  isDeleted?: boolean;

  /** Creation timestamp */
  createdAt?: Date;

  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * SubTask Model Interface
 */
export interface ISubTaskModel extends Model<ISubTask> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISubTask>>;
}
