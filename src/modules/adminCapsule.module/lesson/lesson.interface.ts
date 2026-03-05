//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ILesson {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  title: string;
  attachments?: Types.ObjectId[]; //🔗🖼️
  moduleId: Types.ObjectId; //🔗 FK to parent (e.g., Capsule or Roadmap)
  estimatedTime: string; // e.g., "5m", "1h30m", "2d"

  orderNumber : number;

  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonModel extends Model<ILesson> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ILesson>>;
}