//@ts-ignore
import { model, Schema } from 'mongoose';
import { ILesson, ILessonModel } from './lesson.interface';
import paginate from '../../../common/plugins/paginate';


const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    attachments: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],
    moduleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Capsule', // adjust ref if it points to Roadmap or other
      required: [true, 'moduleId is required'],
    },

    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
      // match: [/^(\d+[hmd])+/i, 'duration must be in format like "5m", "1h30m", "2d"'],
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

LessonSchema.plugin(paginate);

// Use transform to rename _id to _projectId
LessonSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._LessonId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Lesson = model<
  ILesson,
  ILessonModel
>('Lesson', LessonSchema);
