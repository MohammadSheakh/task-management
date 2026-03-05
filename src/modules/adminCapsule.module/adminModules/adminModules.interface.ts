//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IAdminModules {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  title: string;
  description: string;
  attachments?: Types.ObjectId[]; //🔗🖼️
  capsuleId: Types.ObjectId; //🔗
  estimatedTime: string; 

  numberOfLessons : number;

  orderNumber : number;
  
  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminModulesModel extends Model<IAdminModules> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IAdminModules>>;
}