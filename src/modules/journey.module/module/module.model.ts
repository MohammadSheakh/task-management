//@ts-ignore
import { model, Schema } from 'mongoose';
import { IModule, IModuleModel } from './module.interface';
import paginate from '../../../common/plugins/paginate';


const ModuleSchema = new Schema<IModule>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    attachments: [//🔗🖼️ // this is module video
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],
    capsuleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule',
      required: [true, 'capsuleId is required'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

ModuleSchema.plugin(paginate);

// Use transform to rename _id to _projectId
ModuleSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._ModuleId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Module = model<
  IModule,
  IModuleModel
>('Module', ModuleSchema);
