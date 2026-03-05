//@ts-ignore
import { model, Schema } from 'mongoose';
import { IQuestion, IQuestionModel } from './question.interface';
import paginate from '../../../common/plugins/paginate';
import { TQuestion } from './question.constant';

const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: [true, 'questionText is required'],
    },
    helpText: { //🆕
      type: String,
      required: [true, 'helpText is required'],
    },
    type: {
      type: String,
      enum: [
        TQuestion.text,
      ],
      required: [
        false,
        `type is required it can be ${Object.values(TQuestion).join(', ')}`,
      ],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

QuestionSchema.plugin(paginate);

// Use transform to rename _id to _projectId
QuestionSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._QuestionId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Question = model<
  IQuestion,
  IQuestionModel
>('JourneyQuestion', QuestionSchema);
