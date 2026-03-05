import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IMentorReview {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  mentorId : Types.ObjectId;

  review : string;
  rating : number;
  
  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMentorReviewModel extends Model<IMentorReview> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMentorReview>>;
}