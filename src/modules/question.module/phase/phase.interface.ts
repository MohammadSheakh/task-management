import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IPhase {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  phaseNumber: number;
  title: string;
  subTitle: string;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreatePhase{
  phaseNumber: string | IPhase['phaseNumber']
  title : string;
  subTitle : string;
}

export interface IPhaseModel extends Model<IPhase> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPhase>>;
}