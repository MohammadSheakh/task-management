//@ts-ignore
import { model, Schema } from 'mongoose';
import { IStudentModuleTracker, IStudentModuleTrackerModel } from './studentModuleTracker.interface';
import paginate from '../../../common/plugins/paginate';
import { TStudentModuleTrackerStatus } from './studentModuleTracker.constant';


const StudentModuleTrackerSchema = new Schema<IStudentModuleTracker>(
  {
    
    moduleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'moduleId is required'],
    },
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    capsuleId: { //🔗  🆕
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    status: {
      type: String,
      enum: [
        TStudentModuleTrackerStatus.notStarted,
        TStudentModuleTrackerStatus.completed,
      ],
      required: [
        true,
        `status is required it can be ${Object.values(TStudentModuleTrackerStatus).join(', ')}`,
      ],
    },
     
    // progressPercentage: { // we dont need this
    //   type: Number,
    //   required: [true, 'progressPercentage is required'],
    //   min: [0, 'progressPercentage cannot be less than 0'],
    //   max: [100, 'progressPercentage cannot exceed 100'],
    // },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

StudentModuleTrackerSchema.plugin(paginate);

// Use transform to rename _id to _projectId
StudentModuleTrackerSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._StudentModuleTrackerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const StudentModuleTracker = model<
  IStudentModuleTracker,
  IStudentModuleTrackerModel
>('StudentModuleTracker', StudentModuleTrackerSchema);
