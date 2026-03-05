import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';


export interface IPurchasedJourney {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  journeyId: Types.ObjectId; //🔗
  studentId: Types.ObjectId; //🔗
  
  // studentsAnswer: string; // we move this student answer and aiSummary to studentCapsuleTracker
  // aiSummary: string;

  price: number;

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

export interface IPurchasedJourneyModel extends Model<IPurchasedJourney> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPurchasedJourney>>;
}