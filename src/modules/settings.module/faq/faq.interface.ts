import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IFaq {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  faqCategoryId: Types.ObjectId;
  
  question : string;
  answer : string;

  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFaqModel extends Model<IFaq> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IFaq>>;
}