//@ts-ignore
import { model, Schema } from 'mongoose';
import { IQuestionAnswer, IQuestionAnswerModel } from './questionAnswer.interface';
import paginate from '../../../common/plugins/paginate';

const QuestionAnswerSchema = new Schema<IQuestionAnswer>(
  {
    questionId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    answerTitle: {
      type: String,
      required: [true, 'dateOfBirth is required'],
    },
    answerSubTitle: {
      type: String,
      required: [true, 'dateOfBirth is required'],
    },
    displayOrder: {
      type: Number,
      required: [true, 'dateOfBirth is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

QuestionAnswerSchema.plugin(paginate);

// Use transform to rename _id to _projectId
QuestionAnswerSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._questionAnswerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const QuestionAnswer = model<
  IQuestionAnswer,
  IQuestionAnswerModel
>('QuestionAnswer', QuestionAnswerSchema);
