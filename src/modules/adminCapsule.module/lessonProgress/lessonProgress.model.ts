//@ts-ignore
import { model, Schema } from 'mongoose';
import { ILessonProgress, ILessonProgressModel } from './lessonProgress.interface';
import paginate from '../../../common/plugins/paginate';
import { TLessonProgress } from './lessonProgress.constant';


const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    capsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    moduleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'moduleId is required'],
    },
    lessonId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Lesson', // adjust if your lesson model has different name
      required: [true, 'lessonId is required'],
    },
    status: {
      type: String,
      enum: [
        TLessonProgress.locked,
        TLessonProgress.unlocked,
        TLessonProgress.inProgress,
        TLessonProgress.completed,
      ],
      required: [
        true,
        `status is required it can be ${Object.values(TLessonProgress).join(', ')}`,
      ],
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

LessonProgressSchema.plugin(paginate);

// Use transform to rename _id to _projectId
LessonProgressSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._LessonProgressId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const LessonProgress = model<
  ILessonProgress,
  ILessonProgressModel
>('LessonProgress', LessonProgressSchema);
