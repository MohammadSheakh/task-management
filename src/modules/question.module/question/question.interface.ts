import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TQuestionAnswer } from './question.constant';


export interface IQuestion {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  phaseNumber: number;
  phaseId: Types.ObjectId;  //🔗
  questionNumber: number;
  questionText: string;
  answerType: TQuestionAnswer;
  // answers: { answerTitle: string; answerSubTitle: string }[];

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateQuestionAndAnswer {
  phaseNumber: number;
  phaseId: Types.ObjectId;  //🔗
  questionNumber: number;
  questionText: string;
  answerType: TQuestionAnswer;
  answers : {
        answerTitle: string,
        answerSubTitle: string
        // "displayOrder" : "" // order amra automatically set korbo
    }[]
}



export interface IQuestionModel extends Model<IQuestion> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IQuestion>>;
}