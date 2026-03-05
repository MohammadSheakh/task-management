//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMentorReview, IMentorReviewModel } from './mentorReview.interface';
import paginate from '../../../common/plugins/paginate';

const MentorReviewSchema = new Schema<IMentorReview>(
  {
    userId: { //🔗 who provide the review
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    mentorId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
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

MentorReviewSchema.plugin(paginate);

// Use transform to rename _id to _projectId
MentorReviewSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._MentorReviewId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const MentorReview = model<
  IMentorReview,
  IMentorReviewModel
>('MentorReview', MentorReviewSchema);
