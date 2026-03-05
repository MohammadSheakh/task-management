//@ts-ignore
import { model, Schema } from 'mongoose';
import { IPurchasedJourney, IPurchasedJourneyModel } from './purchasedJourney.interface';
import paginate from '../../../common/plugins/paginate';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';


const PurchasedJourneySchema = new Schema<IPurchasedJourney>(
  {
    journeyId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Journey',
      required: [true, 'journeyId is required'],
    },
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },

    // we move this student answer and aiSummary to studentCapsuleTracker
    
    // studentsAnswer: {
    //   type: String,
    //   required: [false, 'studentsAnswer is not required'],
    // },
    // aiSummary: {
    //   type: String,
    //   required: [false, 'aiSummary is not required'],
    // },

    price: {
      type: Number,
      required: [true, 'price is required'],
    },

    paymentTransactionId: { //🔗 Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null, 
      //---------------------------------
      // First This should be null ..
      // In Webhook Handler .. we will update this paymentTransactionId
      //---------------------------------
    },

    paymentMethod: {
      type: String,
      enum: PaymentMethod,
      default: PaymentMethod.online,
    },

    paymentStatus : {
      type: String,
      enum: [
        TPaymentStatus.pending,
        TPaymentStatus.completed,
        TPaymentStatus.refunded,
        TPaymentStatus.failed
      ],
      default: TPaymentStatus.pending,
      required: [false, `paymentStatus is required .. it can be  ${Object.values(TPaymentStatus).join(
                ', '
              )}`],

      //---------------------------------
      // First This should be unpaid ..
      // In Webhook Handler .. we will update this paid
      //---------------------------------

    },


    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

PurchasedJourneySchema.plugin(paginate);

// Use transform to rename _id to _projectId
PurchasedJourneySchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._PurchasedJourneyId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const PurchasedJourney = model<
  IPurchasedJourney,
  IPurchasedJourneyModel
>('PurchasedJourney', PurchasedJourneySchema);
