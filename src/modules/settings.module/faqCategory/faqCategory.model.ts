//@ts-ignore
import { model, Schema } from 'mongoose';
import { IFaqCategory, IFaqCategoryModel } from './faqCategory.interface';
import paginate from '../../../common/plugins/paginate';

const FaqCategorySchema = new Schema<IFaqCategory>(
  {
    categoryName: {
      type: String,
      required: [true, 'categoryName is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

FaqCategorySchema.plugin(paginate);

// Use transform to rename _id to _projectId
FaqCategorySchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._faqCategoryId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const FaqCategory = model<
  IFaqCategory,
  IFaqCategoryModel
>('FaqCategory', FaqCategorySchema);
