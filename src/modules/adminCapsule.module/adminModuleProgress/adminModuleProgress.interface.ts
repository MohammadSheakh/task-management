//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TAdminModuleProgress } from './adminModuleProgress.constant';

export interface IAdminModuleProgress {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  studentId: Types.ObjectId;//🔗
  moduleId: Types.ObjectId; //🔗
  capsuleId: Types.ObjectId; //🔗
  status: TAdminModuleProgress; //🧩
  completedLessonsCount: number;
  totalLessons: number;
  completedAt?: Date;
  viewedAt?: Date;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminModuleProgressModel extends Model<IAdminModuleProgress> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IAdminModuleProgress>>;
}