//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAdminModuleProgress, IAdminModuleProgressModel } from './adminModuleProgress.interface';
import paginate from '../../../common/plugins/paginate';
import { TAdminModuleProgress } from './adminModuleProgress.constant';


const AdminModuleProgressSchema = new Schema<IAdminModuleProgress>(
  {
  
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    moduleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'moduleId is required'],
    },
    capsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    status: {
      type: String,
      enum: [
        TAdminModuleProgress.notStarted,
        TAdminModuleProgress.inProgress,
        TAdminModuleProgress.completed,
        TAdminModuleProgress.unlocked,
        TAdminModuleProgress.locked,
      ],
      required: [
        true,
        `status is required it can be ${Object.values(TAdminModuleProgress).join(', ')}`,
      ],
    },
    completedLessonsCount: {
      type: Number,
      required: [true, 'completedLessonsCount is required'],
      min: [0, 'completedLessonsCount cannot be negative'],
    },
    totalLessons: {
      type: Number,
      required: [true, 'totalLessons is required'],
      min: [1, 'totalLessons must be at least 1'],
    },
    completedAt: {
      type: Date,
      required: false,
    },
    viewedAt: {
      type: Date,
      required: false,
    },
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdminModuleProgressSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AdminModuleProgressSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AdminModuleProgressId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdminModuleProgress = model<
  IAdminModuleProgress,
  IAdminModuleProgressModel
>('AdminModuleProgress', AdminModuleProgressSchema);
