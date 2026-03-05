import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { THaveAdminApproval, TMentorClass } from './mentorProfile.constant';


export interface IMentorProfile {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  attachments?: Types.ObjectId[];
  title: string;
  topics: string[];
  userId: Types.ObjectId;
  //mentorCategoryId: Types.ObjectId;   //❌ tasmia apu remove the category
  language: string[];


  // -----------------
  location : string;
  classType: TMentorClass; // 🔗 
  
  
  sessionPrice: number;
  currentJobTitle: string;
  companyName: string;
  yearsOfExperience: number;
  bio: string;

  //------------------
  
  careerStage: string[];
  focusArea: string[];
  industry: string;

  // -----------------

  coreValues: string[];
  specialties: string[];

  // ----------------

  coachingMethodologies: string[];
  calendlyProfileLink: string;

  // ---------------

  profileInfoFillUpCount: number;
  rating: number;

  //🆕
  haveAdminApproval : THaveAdminApproval;
  isLive : boolean;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMentorProfileModel extends Model<IMentorProfile> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMentorProfile>>;
}