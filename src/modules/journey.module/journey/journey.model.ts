import { model, Schema } from 'mongoose';
import { IJourney, IJourneyModel } from './journey.interface';
import paginate from '../../../common/plugins/paginate';


const JourneySchema = new Schema<IJourney>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'adminId is required'],
    },
    
    numberOfCapsule: { // only for show value
      type: Number,
      required: [false, 'numberOfCapsule is not required'],
    },
    
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    
    brief: {
      type: String,
      required: [true, 'brief is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

JourneySchema.plugin(paginate);

// Use transform to rename _id to _projectId
JourneySchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._journeyId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Journey = model<
  IJourney,
  IJourneyModel
>('Journey', JourneySchema);
