//@ts-ignore
import { model, Schema } from 'mongoose';
import { IQuestion, IQuestionModel } from './question.interface';
import paginate from '../../../common/plugins/paginate';
import { TQuestionAnswer } from './question.constant';


const QuestionSchema = new Schema<IQuestion>(
  {
    
    phaseNumber: {
      type: Number,
      required: [true, 'phaseNumber is required'],
      min: [1, 'phaseNumber must be at least 1'],
    },
    phaseId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Phase',
      required: [true, 'phaseId is required'],
    },
    questionNumber: {
      type: Number,
      required: [true, 'questionNumber is required'],
      min: [1, 'questionNumber must be at least 1'],
    },
    questionText: {
      type: String,
      required: [true, 'questionText is required'],
    },
    answerType: {
      type: String,
      enum: [
        TQuestionAnswer.text,
        TQuestionAnswer.number,
        TQuestionAnswer.single,
        TQuestionAnswer.multi,
      ],
      required: [
        true,
        `answer_type is required it can be ${Object.values(TQuestionAnswer).join(', ')}`,
      ],
    },

    //--------- we keep track of answers in different table 
    // answers: {
    //   type: [
    //     {
    //       answerTitle: { type: String, required: true },
    //       answerSubTitle: { type: String, required: false },
    //     },
    //   ],
    //   required: function (this: IQuestion) {
    //     return this.answer_type === TQuestionAnswer.single || this.answer_type === TQuestionAnswer.multi;
    //   },
    //   default: [],
    // },


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
>('Question', QuestionSchema);
