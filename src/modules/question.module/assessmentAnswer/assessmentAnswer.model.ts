//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAssessmentAnswer, IAssessmentAnswerModel } from './assessmentAnswer.interface';
import paginate from '../../../common/plugins/paginate';
import { TAssessmentAnswer } from './assessmentAnswer.constant';


const AssessmentAnswerSchema = new Schema<IAssessmentAnswer>(
  {
    assessmentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'assessmentId is required'],
    },
    phase_number: { // i dont know why we need this 
      type: Number,
      required: [true, 'phase_number is required'],
      min: [1, 'phase_number must be at least 1'],
    },
    questionId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'questionId is required'],
    },
    answer_value: {
      type: String,
      required: [true, 'answer_value is required'],
    },
    answer_type: {
      type: String,
      enum: [
        TAssessmentAnswer.text,
        TAssessmentAnswer.number,
        TAssessmentAnswer.single,
        TAssessmentAnswer.multi,
      ],
      required: [
        true,
        `answer_type is required it can be ${Object.values(TAssessmentAnswer).join(', ')}`,
      ],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AssessmentAnswerSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AssessmentAnswerSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AssessmentAnswerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AssessmentAnswer = model<
  IAssessmentAnswer,
  IAssessmentAnswerModel
>('AssessmentAnswer', AssessmentAnswerSchema);
