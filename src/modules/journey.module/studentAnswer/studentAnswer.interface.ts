import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TStudentAnswerStatus } from './studentAnswer.constant';


export interface IStudentAnswer {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  questionId: Types.ObjectId; //🔗
  studentId : Types.ObjectId; //🔗
  capsuleId : Types.ObjectId; //🔗

  status: TStudentAnswerStatus; //🧩
  answer: string;
  isCorrect?: boolean;
  isAnswered?: boolean;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentAnswerModel extends Model<IStudentAnswer> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IStudentAnswer>>;
}