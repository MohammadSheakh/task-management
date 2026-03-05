//@ts-ignore
import { model, Schema } from 'mongoose';
import { IPhase, IPhaseModel } from './phase.interface';
import paginate from '../../../common/plugins/paginate';


const PhaseSchema = new Schema<IPhase>(
  {
    phaseNumber: {
      type: Number,
      required: [false, 'phaseNumber is not required']
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    subTitle: {
      type: String,
      required: [true, 'subTitle is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

PhaseSchema.plugin(paginate);

// Use transform to rename _id to _projectId
PhaseSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._PhaseId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Phase = model<
  IPhase,
  IPhaseModel
>('Phase', PhaseSchema);
