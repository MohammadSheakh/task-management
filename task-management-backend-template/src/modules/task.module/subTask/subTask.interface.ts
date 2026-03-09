import { Model, Types, Document } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TSubTaskStatus } from './subTask.constant';

/**
 * SubTask Interface
 * Represents a subtask entity that belongs to a parent task
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export interface ISubTask {
  _id?: Types.ObjectId;

  // ─── Parent Task Reference ─────────────────────────────────────────
  /** Parent task ID */
  taskId: Types.ObjectId;

  // ─── Ownership & Assignment ────────────────────────────────────────
  /** User who created this subtask */
  createdById: Types.ObjectId;

  /** User assigned to this subtask (optional) */
  assignedToUserId?: Types.ObjectId;

  // ─── SubTask Details ───────────────────────────────────────────────
  /** Title of the subtask (required) */
  title: string;

  /** Detailed description (optional) */
  description?: string;

  /** Duration estimate (e.g., "30m", "1h") */
  duration?: string;

  // ─── Progress & Status ─────────────────────────────────────────────
  /** Completion status */
  isCompleted: boolean;

  /** When the subtask was completed */
  completedAt?: Date;

  /** Order/position in the subtask list */
  order: number;

  // ─── System Fields ─────────────────────────────────────────────────
  /** Soft delete flag */
  isDeleted: boolean;

  /** Creation timestamp */
  createdAt?: Date;

  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * SubTask Document Interface
 * Extends ISubTask with Mongoose Document methods
 */
export interface ISubTaskDocument extends ISubTask, Document {
  _id: Types.ObjectId;
}

/**
 * SubTask Model Interface
 * Extends Mongoose Model with pagination and static methods
 */
export interface ISubTaskModel extends Model<ISubTaskDocument> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISubTask>>;

  /**
   * Get completion statistics for a task
   */
  getTaskCompletionStats(taskId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  }>;
}

/**
 * SubTask Query Options Interface
 * For typed pagination and filtering
 */
export interface ISubTaskQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  populate?: Array<{ path: string; select?: string }>;
  select?: string;
  isCompleted?: boolean;
  assignedToUserId?: string;
}

/**
 * SubTask Create DTO
 * Data transfer object for creating a subtask
 */
export interface ICreateSubTask {
  title: string;
  description?: string;
  duration?: string;
  assignedToUserId?: string;
}

/**
 * SubTask Update DTO
 * Data transfer object for updating a subtask
 */
export interface IUpdateSubTask {
  title?: string;
  description?: string;
  duration?: string;
  isCompleted?: boolean;
  assignedToUserId?: string;
  order?: number;
}

/**
 * SubTask Response DTO
 * Matches Flutter model structure
 */
export interface ISubTaskResponse {
  _subTaskId: string;
  title: string;
  isCompleted: boolean;
  duration?: string;
  completedAt?: Date;
}
