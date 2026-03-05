//@ts-ignore
import { model, Schema } from 'mongoose';
import { IFaq, IFaqModel } from './faq.interface';
import paginate from '../../../common/plugins/paginate';


const FaqSchema = new Schema<IFaq>(
  {
    faqCategoryId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'FaqCategory',
    },
    
    question: {
      type: String,
      required: [true, 'question is required'],
    },

    answer: {
      type: String,
      required: [true, 'answer is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

FaqSchema.plugin(paginate);

// Use transform to rename _id to _projectId
FaqSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._FaqId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Faq = model<
  IFaq,
  IFaqModel
>('Faq', FaqSchema);
