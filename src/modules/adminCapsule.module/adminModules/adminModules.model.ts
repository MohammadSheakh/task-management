//@ts-ignore
import { model, Schema } from 'mongoose';
import { IAdminModules, IAdminModulesModel } from './adminModules.interface';
import paginate from '../../../common/plugins/paginate';


const AdminModulesSchema = new Schema<IAdminModules>(
  {
    title: {
      type: String,
      required: [false, 'title is required'], // it must be true
    },
    description: {
      type: String,
      required: [false, 'description is not required'],
    },
    attachments: [ //🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],
    capsuleId: { //🔗 // it must be true
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [false, 'capsuleId is required'],
    },
    estimatedTime: { // it must be true
      type: String,
      required: [false, 'estimatedTime is required'],
    },

    numberOfLessons : {
      type: Number,
      required: [false, 'numberOfLessons is not required'],
    },

    orderNumber: {
      type: Number,
      required: [false, 'orderNumber is not required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdminModulesSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AdminModulesSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AdminModulesId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdminModules = model<
  IAdminModules,
  IAdminModulesModel
>('AdminModules', AdminModulesSchema);
