import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPurchasedAdminCapsuleStatus } from './purchasedAdminCapsule.constant';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';


export interface IPurchasedAdminCapsule {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  capsuleId: Types.ObjectId; //🔗
  studentId: Types.ObjectId; //🔗
  status: TPurchasedAdminCapsuleStatus;  //🧩
  isGifted: boolean;
  uploadedCertificate?: Types.ObjectId[]; //🔗🖼️
  isCertificateUploaded: boolean;
  completedModules: number;
  totalModules: number;
  progressPercent: number;

  totalLessons : number; // 🆕
  completedLessons : number; // 🆕
  completionDate : Date;  // 🆕

  price : number;

  paymentTransactionId: Types.ObjectId | null; //🔗
    paymentMethod: PaymentMethod.online | null;
    paymentStatus: TPaymentStatus.pending |
      TPaymentStatus.completed |
      TPaymentStatus.refunded |
      TPaymentStatus.failed ;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPurchasedAdminCapsuleModel extends Model<IPurchasedAdminCapsule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPurchasedAdminCapsule>>;
}