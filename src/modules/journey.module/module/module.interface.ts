import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IModule {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  title: string;
  description: string;
  attachments:  Types.ObjectId[] | undefined; //🖼️🧩 
  capsuleId: Types.ObjectId; //🔗
  estimatedTime: number;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IModuleModel extends Model<IModule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IModule>>;
}