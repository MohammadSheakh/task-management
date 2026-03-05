//@ts-ignore
import { model, Schema } from 'mongoose';
import { IStudentCapsuleTracker, IStudentCapsuleTrackerModel } from './studentCapsuleTracker.interface';
import paginate from '../../../common/plugins/paginate';
import { TCurrentSection, TTrackerStatus } from './studentCapsuleTracker.constant';

const StudentCapsuleTrackerSchema = new Schema<IStudentCapsuleTracker>(
  {
    capsuleNumber: {
      type: Number,
      required: [false, 'capsuleNumber is not required'],
      // min: [1, 'capsuleNumber must be ≥ 1'],
    },
    title: {
      type: String,
      required: [false, 'title is not required'],
    },
    capsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    currentSection: {
      type: String,
      enum: [ TCurrentSection.introduction, TCurrentSection.inspiration, TCurrentSection.diagnostics, TCurrentSection.science, TCurrentSection.aiSummary],
      required: [true, `currentSection is required. it can be ${Object.values(TCurrentSection).join(', ')}`],
    },
    introStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, `introStatus is required. it can be ${Object.values(TTrackerStatus).join(', ')}`],
    },
    inspirationStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, `inspirationStatus is required. it can be ${Object.values(TTrackerStatus).join(', ')}`],
    },
    diagnosticsStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, `diagnosticsStatus is required. it can be ${Object.values(TTrackerStatus).join(', ')}`],
    },
    scienceStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, `scienceStatus is required. it can be ${Object.values(TTrackerStatus).join(', ')}`],
    },
    aiSummaryStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, `aiSummaryStatus is required. it can be ${Object.values(TTrackerStatus).join(', ')}`],
    },
    overallStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, `overallStatus is required. it can be ${Object.values(TTrackerStatus).join(', ')}`],
    },
    progressPercentage: {
      type: Number,
      required: [false, 'progressPercentage is not required'],
      // min: [0, 'must be ≥ 0'],
      // max: [100, 'must be ≤ 100'],
    },
    aiSummaryContent: {
      type: String,
      required: [false, 'aiSummaryContent is not required'],
    },
    aiSummaryGeneratedAt: {
      type: Date,
      required: [false, 'aiSummaryGeneratedAt is not required'],
    },

    //🆕
    studentsAnswer: {
      type: String,
      required: [false, 'aiSummaryContent is not required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

StudentCapsuleTrackerSchema.plugin(paginate);

// Use transform to rename _id to _projectId
StudentCapsuleTrackerSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._StudentCapsuleTrackerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const StudentCapsuleTracker = model<
  IStudentCapsuleTracker,
  IStudentCapsuleTrackerModel
>('StudentCapsuleTracker', StudentCapsuleTrackerSchema);
