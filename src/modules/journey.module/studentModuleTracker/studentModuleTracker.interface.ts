import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TStudentModuleTrackerStatus } from './studentModuleTracker.constant';


export interface IStudentModuleTracker {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  moduleId: Types.ObjectId;  //🔗
  studentId: Types.ObjectId;  //🔗
  capsuleId : Types.ObjectId;  // 🔗 🆕
  
  // also it will be better if we keep studentCapsuleTracker here .. but cant do that .. 
  // need to think about which one will be better 

  status: TStudentModuleTrackerStatus; //🧩 
  // progressPercentage: number; // we dont need this 

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentModuleTrackerModel extends Model<IStudentModuleTracker> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IStudentModuleTracker>>;
}
