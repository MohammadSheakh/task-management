//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TAdminCapsuleLevel } from './adminCapsule.constant';


export interface IAdminCapsule {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  

  capsuleNumber: number;
  title: string;
  subTitle: string;
  description: string;
  introductionVideo?: Types.ObjectId[]; //🔗🖼️
  attachments?: Types.ObjectId[]; //🔗🖼️
  capsuleCategoryId: Types.ObjectId; //🔗
  price : number;
  // topics: string[];
  estimatedTime?: number; // NEED TO TALK WITH UI .. do we really need this
  totalModule: number;
  level: TAdminCapsuleLevel; //🧩
  adminId: Types.ObjectId; //🔗

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateAdminCapsuleWithTopics {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  // capsuleNumber: number; // may be automatically we create this .. or Ui show this in front-end
  title: string;
  level: string; // TAdminCapsuleLevel
  description: string;
  totalModule: number;
  price : number;
  whatYouLearn : string[]; // we create AdminCapsuleTopic for each ..

  introductionVideo?: Types.ObjectId[]; //🔗🖼️
  attachments?: Types.ObjectId[]; //🔗🖼️
  capsuleCategoryId: Types.ObjectId; //🔗
  
  estimatedTime?: number; // 
  
  adminId: Types.ObjectId; //🔗

}


export interface IAdminCapsuleModel extends Model<IAdminCapsule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IAdminCapsule>>;
}