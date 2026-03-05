import { Meeting } from "../meeting/meeting.model";

// Handle meeting cancellation
export async function handleInviteeCanceled(payload) {
  const eventId = payload.event.uri.split('/').pop();
  
  await Meeting.findOneAndUpdate(
    { calendlyEventId: eventId },
    { status: 'cancelled', cancelledAt: new Date() }
  );
  
  console.log(`❌ Meeting cancelled: ${eventId}`);
}