import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TLessonProgress } from './lessonProgress.constant';


export interface ILessonProgress {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  studentId: Types.ObjectId; //🔗
  capsuleId: Types.ObjectId; //🔗
  moduleId: Types.ObjectId; //🔗
  lessonId: Types.ObjectId; //🔗
  status: TLessonProgress; 
  completedAt?: Date;
  viewedAt?: Date;
  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonProgressModel extends Model<ILessonProgress> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ILessonProgress>>;
}