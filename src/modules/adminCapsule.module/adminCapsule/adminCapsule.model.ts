//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAdminCapsule, IAdminCapsuleModel } from './adminCapsule.interface';
import paginate from '../../../common/plugins/paginate';
import { TAdminCapsuleLevel } from './adminCapsule.constant';


const AdminCapsuleSchema = new Schema<IAdminCapsule>(
  {
    
    capsuleNumber: {
      type: Number,
      required: [false, 'capsuleNumber is not required'],
      min: [1, 'capsuleNumber must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    subTitle: { // in admin end .. this is missing in form
      type: String,
      required: [false, 'subTitle is not required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    introductionVideo: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'introductionVideo is not required'],
      }
    ],
    attachments: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],
    capsuleCategoryId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'CapsuleCategory',
      required: [true, 'capsuleCategoryId is required'],
    },
    // topics: {
    //   type: [String],
    //   required: [true, 'topics is required'],
    // },
    estimatedTime: { // may be we dont need this .. 
      type: Number, //// NEED TO TALK WITH UI .. do we really need this ?
      required: [false, 'estimatedTime is not required'],
      min: [0, 'estimatedTime cannot be negative'],
    },
    totalModule: {
      type: Number,
      required: [true, 'totalModule is required'],
      min: [0, 'totalModule cannot be negative'],
    },
    level: {
      type: String,
      enum: [
        TAdminCapsuleLevel.intermediate,
        TAdminCapsuleLevel.beginner,
        TAdminCapsuleLevel.advanced,
      ],
      required: [
        true,
        `level is required it can be ${Object.values(TAdminCapsuleLevel).join(', ')}`,
      ],
    },
    adminId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'adminId is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdminCapsuleSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AdminCapsuleSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AdminCapsuleId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdminCapsule = model<
  IAdminCapsule,
  IAdminCapsuleModel
>('AdminCapsule', AdminCapsuleSchema);
