//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAdminCapsuleReview, IAdminCapsuleReviewModel } from './adminCapsuleReview.interface';
import paginate from '../../../common/plugins/paginate';


const AdminCapsuleReviewSchema = new Schema<IAdminCapsuleReview>(
  {
    userId: { //🔗 who provide the review
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    adminCapsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'AdminCapsule',
    },
    review: {
      type: String,
      required: [true, 'review is required'],
    },
    rating: {
      type: Number,
      required: [true, 'rating is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdminCapsuleReviewSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AdminCapsuleReviewSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._AdminCapsuleReviewId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdminCapsuleReview = model<
  IAdminCapsuleReview,
  IAdminCapsuleReviewModel
>('AdminCapsuleReview', AdminCapsuleReviewSchema);
