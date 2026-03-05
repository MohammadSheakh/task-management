//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMentorCategory, IMentorCategoryModel } from './mentorCategory.interface';
import paginate from '../../../common/plugins/paginate';


const MentorCategorySchema = new Schema<IMentorCategory>(
  {
    
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    attachments: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],
    mentorId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'mentorId is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

MentorCategorySchema.plugin(paginate);

// Use transform to rename _id to _projectId
MentorCategorySchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._MentorCategoryId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const MentorCategory = model<
  IMentorCategory,
  IMentorCategoryModel
>('MentorCategory', MentorCategorySchema);
