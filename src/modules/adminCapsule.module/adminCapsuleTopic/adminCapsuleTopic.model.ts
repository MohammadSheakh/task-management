//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAdminCapsuleTopic, IAdminCapsuleTopicModel } from './adminCapsuleTopic.interface';
import paginate from '../../../common/plugins/paginate';

const AdminCapsuleTopicSchema = new Schema<IAdminCapsuleTopic>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    adminCapsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'AdminCapsule',
      required: [true, 'adminCapsuleId is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdminCapsuleTopicSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AdminCapsuleTopicSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AdminCapsuleTopicId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdminCapsuleTopic = model<
  IAdminCapsuleTopic,
  IAdminCapsuleTopicModel
>('AdminCapsuleTopic', AdminCapsuleTopicSchema);
