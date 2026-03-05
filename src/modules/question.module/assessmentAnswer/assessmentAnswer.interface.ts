import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TAssessmentAnswer } from './assessmentAnswer.constant';


export interface IAssessmentAnswer {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  assessmentId: Types.ObjectId;
  phase_number: number;
  questionId: Types.ObjectId;
  answer_value: string;
  answer_type: TAssessmentAnswer;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssessmentAnswerModel extends Model<IAssessmentAnswer> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IAssessmentAnswer>>;
}