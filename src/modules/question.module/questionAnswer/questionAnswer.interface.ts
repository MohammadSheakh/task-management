import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IQuestionAnswer {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  questionId : Types.ObjectId;  //🔗
  displayOrder : number;
  answerSubTitle : string;
  answerTitle : string;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestionAnswerModel extends Model<IQuestionAnswer> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IQuestionAnswer>>;
}