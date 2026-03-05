import { z } from 'zod';
import { TTaskStatus, TTaskType, TTaskPriority } from './task.constant';

/**
 * Create Task Validation Schema
 * Validates task creation input
 */
export const createTaskValidationSchema = z.object({
  body: z.object({
    // ─── Required Fields ─────────────────────────────────────────────
    title: z
      .string({
        required_error: 'Task title is required',
      })
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters'),

    taskType: z
      .enum([TTaskType.personal, TTaskType.singleAssignment, TTaskType.collaborative], {
        required_error: 'Task type is required',
      }),

    startTime: z
      .string({
        required_error: 'Start time is required',
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format for startTime',
      }),

    // ─── Optional Fields ─────────────────────────────────────────────
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),

    scheduledTime: z
      .string()
      .optional(),

    priority: z
      .enum([TTaskPriority.low, TTaskPriority.medium, TTaskPriority.high])
      .default(TTaskPriority.medium),

    status: z
      .enum([TTaskStatus.pending, TTaskStatus.inProgress, TTaskStatus.completed])
      .default(TTaskStatus.pending),

    ownerUserId: z
      .string()
      .refine((val) => val.match(/^[0-9a-fA-F]{24}$/), {
        message: 'Invalid ownerUserId format',
      })
      .optional(),

    assignedUserIds: z
      .array(
        z.string().refine((val) => val.match(/^[0-9a-fA-F]{24}$/), {
          message: 'Invalid userId format in assignedUserIds',
        })
      )
      .optional(),

    groupId: z
      .string()
      .refine((val) => val.match(/^[0-9a-fA-F]{24}$/), {
        message: 'Invalid groupId format',
      })
      .optional(),

    dueDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format for dueDate',
      })
      .optional(),

    // ─── Auto-generated (should not come from client) ────────────────
    totalSubtasks: z.number().default(0).optional(),
    completedSubtasks: z.number().default(0).optional(),
  }),
});

/**
 * Update Task Validation Schema
 * All fields optional for partial updates
 */
export const updateTaskValidationSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),

    taskType: z
      .enum([TTaskType.personal, TTaskType.singleAssignment, TTaskType.collaborative])
      .optional(),

    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),

    scheduledTime: z.string().optional(),

    priority: z
      .enum([TTaskPriority.low, TTaskPriority.medium, TTaskPriority.high])
      .optional(),

    status: z
      .enum([TTaskStatus.pending, TTaskStatus.inProgress, TTaskStatus.completed])
      .optional(),

    ownerUserId: z
      .string()
      .refine((val) => val.match(/^[0-9a-fA-F]{24}$/), {
        message: 'Invalid ownerUserId format',
      })
      .optional(),

    assignedUserIds: z
      .array(
        z.string().refine((val) => val.match(/^[0-9a-fA-F]{24}$/), {
          message: 'Invalid userId format in assignedUserIds',
        })
      )
      .optional(),

    startTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format for startTime',
      })
      .optional(),

    completedTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format for completedTime',
      })
      .optional(),

    dueDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format for dueDate',
      })
      .optional(),

    totalSubtasks: z.number().optional(),
    completedSubtasks: z.number().optional(),
  }),
});

/**
 * Update Task Status Validation Schema
 * Specifically for status updates
 */
export const updateTaskStatusValidationSchema = z.object({
  body: z.object({
    status: z
      .enum([TTaskStatus.pending, TTaskStatus.inProgress, TTaskStatus.completed], {
        required_error: 'Status is required',
      }),
    completedTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format for completedTime',
      })
      .optional(),
  }),
});

/**
 * Query Validation Schema for filtering tasks
 */
export const taskQueryValidationSchema = z.object({
  query: z.object({
    status: z
      .enum([TTaskStatus.pending, TTaskStatus.inProgress, TTaskStatus.completed])
      .optional(),

    taskType: z
      .enum([TTaskType.personal, TTaskType.singleAssignment, TTaskType.collaborative])
      .optional(),

    priority: z
      .enum([TTaskPriority.low, TTaskPriority.medium, TTaskPriority.high])
      .optional(),

    from: z.string().optional(), // Start date for range
    to: z.string().optional(), // End date for range

    sortBy: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    populate: z.string().optional(),
  }),
});
