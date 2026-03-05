//@ts-ignore
import { model, Schema } from 'mongoose';
import { ITask, ITaskModel } from './task.interface';
import paginate from '../../common/plugins/paginate';

/**
 * Task Schema
 * Represents a task with support for personal, single assignment, and collaborative tasks
 */
const taskSchema = new Schema<ITask>(
  {
    // ─── Ownership & Assignment ────────────────────────────────────────
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator (createdById) is required'],
    },

    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    taskType: {
      type: String,
      enum: ['personal', 'singleAssignment', 'collaborative'],
      required: [true, 'Task type is required'],
    },

    assignedUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },

    // ─── Task Details ──────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    scheduledTime: {
      type: String,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // ─── Task Progress ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'inProgress', 'completed'],
      default: 'pending',
    },

    totalSubtasks: {
      type: Number,
      default: 0,
    },

    completedSubtasks: {
      type: Number,
      default: 0,
    },

    // ─── Timestamps ────────────────────────────────────────────────────
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },

    completedTime: {
      type: Date,
    },

    dueDate: {
      type: Date,
    },

    // ─── System Fields ─────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── Indexes for Performance ─────────────────────────────────────────
/**
 * Compound indexes for common query patterns
 */
taskSchema.index({ createdById: 1, status: 1, startTime: -1 });
taskSchema.index({ ownerUserId: 1, status: 1, startTime: -1 });
taskSchema.index({ assignedUserIds: 1, status: 1 });
taskSchema.index({ groupId: 1, status: 1 });
taskSchema.index({ startTime: 1 });
taskSchema.index({ dueDate: 1 });

// ─── Plugins ─────────────────────────────────────────────────────────
taskSchema.plugin(paginate);

// ─── Virtuals ────────────────────────────────────────────────────────
/**
 * Virtual to calculate completion percentage
 */
taskSchema.virtual('completionPercentage').get(function () {
  const task = this as any;
  if (task.totalSubtasks === 0) return 0;
  return Math.round((task.completedSubtasks / task.totalSubtasks) * 100);
});

/**
 * Virtual to check if task is overdue
 */
taskSchema.virtual('isOverdue').get(function () {
  const task = this as any;
  if (task.status === 'completed') return false;
  if (!task.dueDate) return false;
  return new Date() > task.dueDate;
});

// ─── Transform ───────────────────────────────────────────────────────
/**
 * Transform schema output for API responses
 * Renames _id to _taskId and includes virtuals
 */
taskSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._taskId = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// ─── Static Methods ──────────────────────────────────────────────────
/**
 * Get tasks count for a user on a specific date
 * Used for daily task limit validation
 */
taskSchema.statics.countTasksForDate = async function (
  userId: Types.ObjectId,
  date: Date
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await this.countDocuments({
    ownerUserId: userId,
    startTime: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    isDeleted: false,
  });

  return count;
};

export const Task = model<ITask, ITaskModel>('Task', taskSchema);
