//@ts-ignore
import { Queue, Worker, QueueScheduler, Job } from "bullmq"; 
import { errorLogger, logger } from "../../shared/logger";
import { Notification } from "../../modules/notification/notification.model";
import { INotification } from "../../modules/notification/notification.interface";
import { redisPubClient } from "../redis/redis";
import { socketService } from "../socket/socketForChatV3";
import { TRole } from "../../middlewares/roles";
import { Conversation } from "../../modules/chatting.module/conversation/conversation.model";
import { IConversation } from "../../modules/chatting.module/conversation/conversation.interface";
import { ConversationParticipents } from "../../modules/chatting.module/conversationParticipents/conversationParticipents.model";
//@ts-ignore
import mongoose from 'mongoose';
import { buildTranslatedField } from "../../utils/buildTranslatedField";

/*-─────────────────────────────────
|  Notification Queue
└──────────────────────────────────*/
export const notificationQueue = new Queue("notificationQueue-e-learning", {
  connection: redisPubClient.options,
});
// new QueueScheduler("notificationQueue", { connection: redisPubClient.options });

type NotificationJobName = "sendNotification";


interface IScheduleJobForNotification {
  name: string;
  data : INotification,
  id: string
}

export const startNotificationWorker = () => {
  const worker = new Worker(
    "notificationQueue-e-learning",
    async (
      job: IScheduleJobForNotification
      // job : Job<INotification, any, NotificationJobName>
    ) => {
      console.log("job.data testing startNotificationWorker::", job.data)
      const { id, name, data } = job;
      logger.info(`Processing notification job ${id} ⚡ ${name}`, data);

      try {

        // Translate multiple properties dynamically
        const [titleObj] : [any]  = await Promise.all([
          buildTranslatedField(data.title as string)
        ]);

        const notif = await Notification.create({
          // title: data.title,
          title: titleObj,
          // subTitle: data.subTitle,
          senderId: data.senderId,
          receiverId: data.receiverId,
          receiverRole: data.receiverRole,
          type: data.type,
          linkFor: data.linkFor,
          linkId: data.linkId,
          referenceFor: data.referenceFor,
          referenceId: data.referenceId,
        });

        logger.info(`✅ Notification created for ${data.receiverRole} :: `, notif);
        
        let eventName;
        let emitted;

        // 🎨 GUIDE FOR FRONTEND .. if admin then listen for notification::admin event  
        if(data.receiverRole == TRole.admin){
          
          eventName = `notification::admin`;

          emitted = socketService.emitToRole(
            data.receiverRole,
            eventName,
            {
              title: data.title,
              senderId: data.senderId,
              receiverId: null,
              receiverRole: data.receiverRole,
              type: data.type,
              linkFor: data.linkFor,
              linkId: data.linkId,
              referenceFor: data.referenceFor,
              referenceId: data.referenceId,
            }            
          );

          if (emitted) {
            logger.info(`🔔 Real-time notification sent to ${data.receiverRole}`);
          } else {
            logger.info(`📴 ${data.receiverRole} is offline, notification saved in DB only`);
          }

        }else{
        
          const receiverId = data.receiverId.toString(); // Ensure it's a string
          eventName = `notification::${receiverId}`;

          // Try to emit to the user
          emitted = await socketService.emitToUser(
            receiverId,
            eventName,
            {
              title: data.title,
              senderId: data.senderId,
              receiverId: data.receiverId,
              receiverRole: data.receiverRole,
              type: data.type,
              linkFor: data.linkFor,
              linkId: data.linkId,
              referenceFor: data.referenceFor,
              referenceId: data.referenceId,
            }
          );

          if (emitted) {
            logger.info(`🔔 Real-time notification sent to user ${receiverId}`);
          } else {
            logger.info(`📴 User ${receiverId} is offline, notification saved in DB only`);
          }
        }

      } catch (err: any) {
        console.log("⭕ error block hit  of notification worker", err)
        errorLogger.error(
          `❌ Notification job ${id} failed: ${err.message}`
        );
        throw err; // ensures retry/backoff
      }
    },
    { connection: redisPubClient.options }
  );
  //@ts-ignore
  worker.on("completed", (job) =>
    logger.info(`✅ Notification job ${job.id} (${job.name}) completed`)
  );
  //@ts-ignore
  worker.on("failed", (job, err) =>
    errorLogger.error(`❌ Notification job ${job?.id} (${job?.name}) failed`, err)
  );
};


/*-─────────────────────────────────
|  Update Conversations Last Message Queue
└──────────────────────────────────*/

export const updateConversationsLastMessageQueue = new Queue("updateConversationsLastMessageQueue-suplify", {
  connection: redisPubClient.options,
});

interface IScheduleJobForUpdateConversationsLastMessage {
  name: string;
  data : IConversation, // conversation update er jonno different ekta interface create kore .. sheta use korte hobe .. 
  id: string
}

export const startUpdateConversationsLastMessageWorker = () => {
  const worker = new Worker(
    "updateConversationsLastMessageQueue-suplify",
    async (
      job: IScheduleJobForUpdateConversationsLastMessage
      // job : Job<INotification, any, NotificationJobName>
    ) => {
      // console.log("job.data testing startUpdateConversationsLastMessageWorker::", job.data)
      const { id, name, data } = job;
      logger.info(`Processing notification job ${id} ⚡ ${name}`, data);

      try {
        const updatedConversation = await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessageId: data.lastMessageId,
          lastMessage: data.lastMessage,
        });

        logger.info(`✅ Conversation updated for ${data.conversationId} :: `, updatedConversation);
        
      } catch (err: any) {
        console.log("⭕ error block hit  of notification worker", err)
        errorLogger.error(
          `❌ Notification job ${id} failed: ${err.message}`
        );
        throw err; // ensures retry/backoff
      }
    },
    { connection: redisPubClient.options }
  );
  //@ts-ignore
  worker.on("completed", (job) =>
    logger.info(`✅ Notification job ${job.id} (${job.name}) completed`)
  );
  //@ts-ignore
  worker.on("failed", (job, err) =>
    errorLogger.error(`❌ Notification job ${job?.id} (${job?.name}) failed`, err)
  );
};


/*-─────────────────────────────────
|  Notify All Conversation participants Queue
└──────────────────────────────────*/

export const notifyParticipantsQueue = new Queue<INotifyParticipantsJobData>(
  'notify-participants-queue-suplify',
  { connection: redisPubClient.options }
);

export interface INotifyParticipantsJobData {
  conversationId: string;
  messageId: string;
  messageText: string;
  senderId: string;
  senderProfile: {
    name: string;
    profileImage?: string;
    role?: string;
  };
  participantIds: string[]; // list of all participant user IDs (strings)
}

export const startNotifyParticipantsWorker = () => {
  const worker = new Worker<INotifyParticipantsJobData>(
    'notify-participants-queue-suplify',
    async (job:Job) => {
      const { conversationId, messageId, messageText, senderId, senderProfile, participantIds } = job.data;

      logger.info(`Notifying ${participantIds.length} participants for conversation ${conversationId}`);

      //☑️🟣 Note: We use for...of instead of forEach + async to avoid race conditions and ensure proper error handling per participant.

      // Process each participant
      for (const participantId of participantIds) {
        // if (participantId === senderId) continue; // skip sender // 🆕 as per nirob vai .. 

        try {
          const isOnline = await socketService.isUserOnline(participantId);
          // const isInRoom = await socketService.redisStateManager.isUserInRoom(participantId, conversationId);
          const isInRoom = await socketService.isUserInRoom(participantId, conversationId);

          if (isInRoom) {
            // Emit conversation list update (no unread count bump)
            await socketService.emitToUser(participantId, `conversation-list-updated::${participantId}`, {
              userId: senderProfile,
              conversations: [{
                _conversationId: conversationId,
                lastMessage: messageText,
                updatedAt: new Date(), // or pass timestamp from job if needed
              }],
            });
          } else if (isOnline && !isInRoom) {

            await socketService.emitToUser(participantId, `conversation-list-updated::${participantId}`, {
              userId: senderProfile,
              conversations: [{
                _conversationId: conversationId,
                lastMessage: messageText,
                updatedAt: new Date(),
              }],
            });

            if (participantId === senderId) continue;  // 🆕🆕🆕

            // Update unread count
            const updatedParticipant = await ConversationParticipents.findOneAndUpdate(
              { 
                userId: new mongoose.Types.ObjectId(participantId),
                conversationId: new mongoose.Types.ObjectId(conversationId)
              },
              { 
                $set: { isThisConversationUnseen: 1 },
                // $inc: { unreadCount: 1 }  // ⭕ this is risky ..
                /**
                 * ❌ Why this is dangerous -
                 *  see details chatting.module -> unread-count-issue.md
                 * You are mutating unread count blindly, without knowing whether the message was already read or processed.
                 **/ 
              },
              { new: true }
            );

            // Calculate total unseen conversations
            const [result] = await ConversationParticipents.aggregate([
              { $match: { userId: new mongoose.Types.ObjectId(participantId) } },
              { $group: { _id: null, totalUnseen: { $sum: "$isThisConversationUnseen" } } }
            ]);

            const unreadConversationCount = result?.totalUnseen || 0;

            // Emit both events
            await socketService.emitToUser(participantId, `unseen-count::${participantId}`, {
              unreadConversationCount
            });

            
          }else{
            // If offline → skip (or add push notification later)

            if (participantId === senderId) continue;  // 🆕🆕🆕

            // Update unread count
            const updatedParticipant = await ConversationParticipents.findOneAndUpdate(
              { 
                userId: new mongoose.Types.ObjectId(participantId),
                conversationId: new mongoose.Types.ObjectId(conversationId)
              },
              {
                $set: { isThisConversationUnseen: 1 },
                // $inc: { unreadCount: 1 }  // ⭕ this is risky ..
                /**
                 * ❌ Why this is dangerous -
                 *  see details chatting.module -> unread-count-issue.md
                 * You are mutating unread count blindly, without knowing whether the message was already read or processed.
                 **/ 
              },
              { new: true }
            );

            // Calculate total unseen conversations
            const [result] = await ConversationParticipents.aggregate([
              { $match: { userId: new mongoose.Types.ObjectId(participantId) } },
              { $group: { _id: null, totalUnseen: { $sum: "$isThisConversationUnseen" } } }
            ]);

            const unreadConversationCount = result?.totalUnseen || 0;

            // Emit both events
            await socketService.emitToUser(participantId, `unseen-count::${participantId}`, {
              unreadConversationCount
            });
          }
          
        } catch (err) {
          errorLogger.error(`Failed to notify participant ${participantId}:`, err);
          // Don't throw → continue with others
        }
      }

      return { notified: participantIds.filter(id => id !== senderId) };
    },
    { connection: redisPubClient.options }
  );

  worker.on('completed', (job:Job, result:any) =>
    logger.info(`✅ Notify job ${job.id} completed. Notified ${result?.notified?.length || 0} users.`)
  );

  worker.on('failed', (job:Job, err:any) =>
    errorLogger.error(`❌ Notify job ${job.id} failed`, err)
  );
};