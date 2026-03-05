//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMeeting, IMeetingModel } from './meeting.interface';
import paginate from '../../../common/plugins/paginate';
import mongoose from 'mongoose';

const MeetingSchema = new Schema<IMeeting>(
  {
    calendlyEventId: { 
      type: String, required: true, unique: true },
    calendlyInviteeId: { type: String, required: true },
    
    // Relationships
    mentorId: { 
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentEmail: { 
      type: String, required: true },
    
    studentName: String,
    
    // Event details
    eventType: String, // "Intro Call", "Mentorship Session"
    scheduledAt: { type: Date, required: true },
    duration: Number, // minutes
    location: String, // "Zoom", "Google Meet", etc.
    
    // Status tracking
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    
    // Calendly raw payload (for audit)
    rawPayload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

MeetingSchema.plugin(paginate);

// Use transform to rename _id to _projectId
MeetingSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._MeetingId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Meeting = model<
  IMeeting,
  IMeetingModel
>('Meeting', MeetingSchema);
