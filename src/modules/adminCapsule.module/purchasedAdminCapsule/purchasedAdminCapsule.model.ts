//@ts-ignore
import { model, Schema } from 'mongoose';
import { IPurchasedAdminCapsule, IPurchasedAdminCapsuleModel } from './purchasedAdminCapsule.interface';
import paginate from '../../../common/plugins/paginate';
import { TPurchasedAdminCapsuleStatus } from './purchasedAdminCapsule.constant';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';


const PurchasedAdminCapsuleSchema = new Schema<IPurchasedAdminCapsule>(
  {
    
    capsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    status: {
      type: String,
      enum: [
        TPurchasedAdminCapsuleStatus.start,
        TPurchasedAdminCapsuleStatus.inProgress,
        TPurchasedAdminCapsuleStatus.complete,
      ],
      required: [
        true,
        `status is required it can be ${Object.values(TPurchasedAdminCapsuleStatus).join(', ')}`,
      ],
    },
    isGifted: {
      type: Boolean,
      required: [true, 'isGifted is required'],
    },
    uploadedCertificate: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'uploadedCertificate is not required'],
      }
    ],

    price: {
      type: Number,
      required: [true, 'price is required'],
    },

    isCertificateUploaded: {
      type: Boolean,
      required: [true, 'isCertificateUploaded is required'],
    },
    completedModules: {
      type: Number,
      required: [false, 'completedModules is required'],
      min: [0, 'completedModules cannot be negative'],
    },
    totalModules: {
      type: Number,
      required: [true, 'totalModules is required'],
      min: [0, 'totalModules cannot be negative'],
    },

    // ================== 🆕
    completedLessons: {
      type: Number,
      required: [false, 'completedLessons is required'],
      min: [0, 'completedLessons cannot be negative'],
    },
    
    // ================== 🆕
    totalLessons: {
      type: Number,
      required: [false, 'totalLessons is not required'],
      min: [0, 'totalLessons cannot be negative'],
    },

    // ================== 🆕
    completionDate : {
      type : Date,
      required: [false, 'completionDate is not required'],
    },

    progressPercent: {
      type: Number,
      required: [false, 'progressPercent is required'],
      min: [0, 'progressPercent cannot be less than 0'],
      max: [100, 'progressPercent cannot exceed 100'],
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
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

PurchasedAdminCapsuleSchema.plugin(paginate);

// Use transform to rename _id to _projectId
PurchasedAdminCapsuleSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._PurchasedAdminCapsuleId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const PurchasedAdminCapsule = model<
  IPurchasedAdminCapsule,
  IPurchasedAdminCapsuleModel
>('PurchasedAdminCapsule', PurchasedAdminCapsuleSchema);
