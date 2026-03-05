//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISubTask, ISubTaskModel } from './subTask.interface';
import paginate from '../../common/plugins/paginate';

/**
 * SubTask Schema
 * Represents a subtask that belongs to a parent task
 */
const subTaskSchema = new Schema<ISubTask>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Parent task ID is required'],
      index: true,
    },

    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },

    assignedToUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    duration: {
      type: String,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    order: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────
subTaskSchema.index({ taskId: 1, isCompleted: 1 });
subTaskSchema.index({ taskId: 1, order: 1 });
subTaskSchema.index({ assignedToUserId: 1, isCompleted: 1 });

// ─── Plugins ─────────────────────────────────────────────────────────
subTaskSchema.plugin(paginate);

// ─── Transform ───────────────────────────────────────────────────────
subTaskSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._subTaskId = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// ─── Static Methods ──────────────────────────────────────────────────
/**
 * Get completion statistics for a task
 */
subTaskSchema.statics.getTaskCompletionStats = async function (taskId: string) {
  const stats = await this.aggregate([
    {
      $match: {
        taskId: new Schema.Types.ObjectId(taskId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$isCompleted',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((sum, stat) => sum + stat.count, 0);
  const completed = stats.find((s) => s._id === true)?.count || 0;

  return {
    total,
    completed,
    pending: total - completed,
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const SubTask = model<ISubTask, ISubTaskModel>('SubTask', subTaskSchema);
