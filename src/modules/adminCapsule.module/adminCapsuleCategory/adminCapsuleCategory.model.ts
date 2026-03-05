//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAdminCapsuleCategory, IAdminCapsuleCategoryModel } from './adminCapsuleCategory.interface';
import paginate from '../../../common/plugins/paginate';


const AdminCapsuleCategorySchema = new Schema<IAdminCapsuleCategory>(
  {
    
    title: {
      type: String,
      required: [true, 'name is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    attachments: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdminCapsuleCategorySchema.plugin(paginate);

// Use transform to rename _id to _projectId
AdminCapsuleCategorySchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AdminCapsuleCategoryId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdminCapsuleCategory = model<
  IAdminCapsuleCategory,
  IAdminCapsuleCategoryModel
>('AdminCapsuleCategory', AdminCapsuleCategorySchema);
