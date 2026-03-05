//@ts-ignore
import { model, Schema } from 'mongoose';
import { IStudentAnswer, IStudentAnswerModel } from './studentAnswer.interface';
import paginate from '../../../common/plugins/paginate';
import { TStudentAnswerStatus } from './studentAnswer.constant';


const StudentAnswerSchema = new Schema<IStudentAnswer>(
  {
    questionId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'questionId is required'],
    },
    studentId: {  //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },

    capsuleId: {  //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },

    status: {
      type: String,
      enum: [
        TStudentAnswerStatus.inProgress,
        TStudentAnswerStatus.completed,
      ],
      required: [
        true,
        `status is required it can be ${Object.values(TStudentAnswerStatus).join(', ')}`,
      ],
    },
    answer: {
      type: String,
      required: [true, 'answer is required'],
    },
    isCorrect: {
      type: Boolean,
      required: false,
    },
    isAnswered: {
      type: Boolean,
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

StudentAnswerSchema.plugin(paginate);

// Use transform to rename _id to _projectId
StudentAnswerSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._StudentAnswerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const StudentAnswer = model<
  IStudentAnswer,
  IStudentAnswerModel
>('StudentAnswer', StudentAnswerSchema);
