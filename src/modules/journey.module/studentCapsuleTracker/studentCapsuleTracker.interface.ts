import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TCurrentSection, TTrackerStatus } from './studentCapsuleTracker.constant';


export interface IStudentCapsuleTracker {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  // userId: Types.ObjectId;
  
  capsuleNumber?: number;
  title?: string;
  capsuleId: Types.ObjectId; //🔗
  studentId: Types.ObjectId; //🔗
  currentSection: TCurrentSection.introduction | 
    TCurrentSection.inspiration | TCurrentSection.diagnostics |
    TCurrentSection.science | TCurrentSection.aiSummary;

  introStatus: TTrackerStatus;
  inspirationStatus: TTrackerStatus;
  diagnosticsStatus: TTrackerStatus;
  scienceStatus: TTrackerStatus;
  aiSummaryStatus: TTrackerStatus;
  overallStatus: TTrackerStatus;
  progressPercentage? : number;
  aiSummaryContent? : string;
  aiSummaryGeneratedAt? : Date;
  //🆕
  studentsAnswer : string;


  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentCapsuleTrackerModel extends Model<IStudentCapsuleTracker> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IStudentCapsuleTracker>>;
}