import { TRole } from "../../../middlewares/roles";
import { enqueueWebNotification } from "../../../services/notification.service";
import { TNotificationType } from "../../notification/notification.constants";
import { IMeeting } from "../meeting/meeting.interface";
import { Meeting } from "../meeting/meeting.model";

// Handle new meeting scheduled
export async function handleInviteeCreated(user, payload) {
  // Extract invitee details
  const {
    uri: inviteeUri,
    email: studentEmail,
    name: studentName,
    scheduled_event
  } = payload.invitee;
  
  const inviteeId = inviteeUri.split('/').pop();
  const eventId = scheduled_event.uri.split('/').pop();
  
  // Create meeting record
  const meeting:IMeeting = await Meeting.findOneAndUpdate(
    { calendlyEventId: eventId },
    {
      calendlyEventId: eventId,
      calendlyInviteeId: inviteeId,
      mentorId: user._id,
      studentEmail,
      studentName,
      eventType: payload.event_type?.name || 'Session',
      scheduledAt: new Date(scheduled_event.start_time),
      duration: scheduled_event.duration,
      location: scheduled_event.location?.type || 'virtual',
      status: 'scheduled',
      rawPayload: payload
    },
    { upsert: true, new: true }
  );
  
  /*---------------------------
  // Notify mentor (in-app + email)
  await sendMeetingNotification({
    userId: user._id,
    type: 'new_meeting',
    data: {
      studentName,
      studentEmail,
      scheduledAt: meeting.scheduledAt,
      meetingId: meeting._id
    }
  });
  ------------------------------*/

  await enqueueWebNotification(
    `Student ${studentName} book a session at ${meeting.scheduledAt}`,
    null, // senderId
    user._id, // receiverId
    TRole.mentor, // receiverRole
    TNotificationType.sessionBooking, // type // 🎨 this is for wallet page routing
    meeting._id, // id of type 
    null, // linkFor 
    null, // linkId
  );

  
  console.log(`✅ New meeting created: ${meeting._id} for mentor ${user.email}`);
}
