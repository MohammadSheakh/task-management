//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAssessment, IAssessmentModel } from './assessment.interface';
import paginate from '../../../common/plugins/paginate';

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isCompleted: {
      type: Boolean,
      required: [false, 'isCompleted is not required'],
    },
    currentPhaseId: {  //🔗
      type: Schema.Types.ObjectId,
      ref: 'Phase',
      required: [false, 'currentPhaseId is not required'],
    },
    currentQuestionId: {  //🔗
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [false, 'currentQuestionId is not required'],
    },
    currentPhaseNumber: {
      type: Number,
      required: [false, 'currentPhaseNumber is not required'],
      // min: [1, 'currentPhaseNumber must be at least 1'],
    },
    currentQuestionNumber: {
      type: Number,
      required: [false, 'currentQuestionNumber is not required'],
      // min: [1, 'currentQuestionNumber must be at least 1'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AssessmentSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AssessmentSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AssessmentId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Assessment = model<
  IAssessment,
  IAssessmentModel
>('Assessment', AssessmentSchema);
