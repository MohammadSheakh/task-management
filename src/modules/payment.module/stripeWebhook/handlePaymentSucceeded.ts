import ApiError from "../../../errors/ApiError";
import { TRole } from "../../../middlewares/roles";
import { enqueueWebNotification } from "../../../services/notification.service";
import { TNotificationType } from "../../notification/notification.constants";
import { IUser } from "../../token/token.interface";
import { User } from "../../user.module/user/user.model";
import { WalletService } from "../../wallet.module/wallet/wallet.service";
import { TPaymentGateway, TPaymentStatus } from "../paymentTransaction/paymentTransaction.constant";
import { PaymentTransaction } from "../paymentTransaction/paymentTransaction.model";
//@ts-ignore
import Stripe from "stripe";
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from "mongoose";
import { PurchasedJourney } from "../../journey.module/purchasedJourney/purchasedJourney.model";
import { TTransactionFor } from "../../../constants/TTransactionFor";
import { IPurchasedJourney } from "../../journey.module/purchasedJourney/purchasedJourney.interface";
import { Capsule } from "../../journey.module/capsule/capsule.model";
import { ICapsule } from "../../journey.module/capsule/capsule.interface";
import { IStudentCapsuleTracker } from "../../journey.module/studentCapsuleTracker/studentCapsuleTracker.interface";
import { TCurrentSection, TTrackerStatus } from "../../journey.module/studentCapsuleTracker/studentCapsuleTracker.constant";
import { StudentCapsuleTracker } from "../../journey.module/studentCapsuleTracker/studentCapsuleTracker.model";
import { IPurchasedAdminCapsule } from "../../adminCapsule.module/purchasedAdminCapsule/purchasedAdminCapsule.interface";
import { PurchasedAdminCapsule } from "../../adminCapsule.module/purchasedAdminCapsule/purchasedAdminCapsule.model";
import { AdminModules } from "../../adminCapsule.module/adminModules/adminModules.model";
import { IAdminModules } from "../../adminCapsule.module/adminModules/adminModules.interface";
import { IAdminModuleProgress } from "../../adminCapsule.module/adminModuleProgress/adminModuleProgress.interface";
import { TAdminModuleProgress } from "../../adminCapsule.module/adminModuleProgress/adminModuleProgress.constant";
import { AdminModuleProgress } from "../../adminCapsule.module/adminModuleProgress/adminModuleProgress.model";
import { ILesson } from "../../adminCapsule.module/lesson/lesson.interface";
import { Lesson } from "../../adminCapsule.module/lesson/lesson.model";
import { LessonProgress } from "../../adminCapsule.module/lessonProgress/lessonProgress.model";
import { TLessonProgress } from "../../adminCapsule.module/lessonProgress/lessonProgress.constant";
import { ILessonProgress } from "../../adminCapsule.module/lessonProgress/lessonProgress.interface";


const walletService = new WalletService();

// Function for handling a successful payment
export const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
     
     try {

          console.log("session.metadata 🔎🔎", session.metadata)

          const { 
               referenceId, // bookingId
               user,
               referenceFor, // TTransactionFor .. bookingId related to which model
               currency,
               amount,
               referenceId2, // if more data is needed
               referenceFor2, // if more data is needed .. referenceId2 related to which model
               ...rest  // 👈 This captures everything else
          }: any = session.metadata;
          // userId // for sending notification .. 

          let _user:IUser = JSON.parse(user);

          const thisCustomer = await User.findOne({ _id: _user.userId });

          if (!thisCustomer) {
               throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found');
          }

          // TODO : 🟢🟢
          // Based on referenceId and referenceFor .. we need to check
          // that Id exist or not in our database .. 

          const paymentIntent = session.payment_intent as string;
          console.log('=============================');
          console.log('paymentIntent : ', paymentIntent);
          
          const isPaymentExist = await PaymentTransaction.findOne({ paymentIntent });

          if (isPaymentExist) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'From Webhook handler : Payment Already exist');
          }

          if(referenceFor === TTransactionFor.UserSubscription){

               // which means we dont create paymentTransaction here ..
               // we want to create  paymentTransaction in handleSuccessfulPayment
               console.log("🟡🟡 which means we dont create paymentTransaction here 🟡🟡 we want to create  paymentTransaction in handleSuccessfulPayment")
               // lets test ... 
               return
          }
          
          const newPayment = await PaymentTransaction.create({
               userId: _user.userId,
               referenceFor, // If this is for Order .. we pass "Order" here
               referenceId, // If this is for Order .. then we pass OrderId here
               paymentGateway: TPaymentGateway.stripe,
               transactionId: session.id,
               paymentIntent: paymentIntent,
               amount: amount,
               currency,
               paymentStatus: TPaymentStatus.completed,
               gatewayResponse: session,
          });

          let updatedObjectOfReferenceFor: any;
          if (referenceFor === TTransactionFor.PurchasedJourney) {
               
               updatedObjectOfReferenceFor = updatePurchasedJourney(
                    _user,
                    referenceId, // purchasedJourneyId
                    newPayment._id, 
                    referenceId2, // journeyId,
                    referenceFor2, // Journey Model Name 
               );

          }else if (referenceFor === TTransactionFor.PurchasedAdminCapsule){
               updatedObjectOfReferenceFor = updatePurchasedAdminCapsule(
                    _user,
                    referenceId, // purchasedJourneyId
                    newPayment._id, 
                    referenceId2, // adminCapsuleId,
                    referenceFor2, // AdminCapsule Model Name 
               );
          }else{
               console.log(`🔎🔎🔎🔎🔎 May be we need to handle this  ${referenceFor} :: ${referenceId}`)
          }

          // if (!updatedObjectOfReferenceFor) {
          //      throw new ApiError(StatusCodes.NOT_FOUND, `In handlePaymentSucceeded Webhook Handler.. Booking not found 🚫 For '${referenceFor}': Id : ${referenceId}`);
          // }

          //---------------------------------
          // Notification Send korte hobe .. TODO :
          //---------------------------------

          return { payment: newPayment, paymentFor: updatedObjectOfReferenceFor };
     } catch (error) {
          console.error('Error in handlePaymentSucceeded:', error);
     }
};

//---------------------------------
// 🥇
//  const refModel = mongoose.model(result.type);
//  const isExistRefference = await refModel.findById(result.refferenceId).session(session);
//---------------------------------

async function updatePurchasedJourney(
     user: IUser,
     purchasedJourneyId: string,
     paymentTransactionId: string,
     journeyId : string,
     JourneyModelName : string,
){

     // isBookingExists = await Order.findOne({ _id: orderId });

     const updatedPurchasedJourney:IPurchasedJourney = await PurchasedJourney.findByIdAndUpdate(purchasedJourneyId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: TPaymentStatus.completed,
     }, { new: true });


     // Create all Student Capsule Tracker at purchase time 
     // get all capsules by purchasedJourneyId

     const capsules: ICapsule[] = await Capsule.find({
          journeyId : journeyId,
          isDeleted : false,
     }) 

     /*-─────────────────────────────────
     |  prepare StudentCapsuleTracker for bulk insert
     └──────────────────────────────────*/
     const studentCapsuleTrackers : IStudentCapsuleTracker[] = capsules.map((capsule : ICapsule) => ({
          capsuleNumber : capsule.capsuleNumber,
          title : capsule.title,
          capsuleId : capsule._id,
          studentId : user.userId,
          overallStatus : TTrackerStatus.notStarted,
          /*---------
          
               only introStatus inProgress e thakbe .. 
               baki gula notStarted e thakbe .. 

               jokhon e ek page theke arek page e jaowa hobe .. shei page er status 
               'notStarted' -> 'inProgress' e shift hoye jabe 

          -----------*/
          introStatus : TTrackerStatus.inProgress, // TTrackerStatus.notStarted
          inspirationStatus : TTrackerStatus.notStarted, // TTrackerStatus.notStarted
          diagnosticsStatus : TTrackerStatus.notStarted, // TTrackerStatus.notStarted
          scienceStatus : TTrackerStatus.notStarted, // TTrackerStatus.notStarted
          aiSummaryStatus : TTrackerStatus.notStarted, // TTrackerStatus.notStarted
          currentSection : TCurrentSection.introduction,
          progressPercentage : 0,
     }))

     console.log("studentCapsuleTrackers 🆕🆕 : ", studentCapsuleTrackers)

     const res = await StudentCapsuleTracker.insertMany(studentCapsuleTrackers);

     
     await enqueueWebNotification(
          `A Student ${user.userId} ${user.userName} purchased a journey, TxnId : ${paymentTransactionId}`,
          user.userId, // senderId
          null, // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.payment, // type
          //---------------------------------
          // In UI there is a details page for order in admin end 
          //---------------------------------
          '', // linkFor // TODO : MUST add the query params 
          orderId, // linkId
          // TTransactionFor.TrainingProgramPurchase, // referenceFor
          // purchaseTrainingProgram._id // referenceId
     );

     return updatedPurchasedJourney;
}

async function updatePurchasedAdminCapsule(
     user: IUser,
     purchasedAdminCapsuleId: string,
     paymentTransactionId: string,
     adminCapsuleId : string,
     AdminCapsuleModelName : string,
){

     

     // Create all Student Capsule Tracker at purchase time 
     // get all capsules by purchasedJourneyId 

     const adminModules: IAdminModules[] = await AdminModules.find({
          capsuleId : adminCapsuleId,
          isDeleted : false,
     }).sort({ orderNumber: 1 }); // ✅ sorted so we know which is first
     
     console.log("adminModules :: ", adminModules)

     // Get all lessons for all modules in one query
     const moduleIds = adminModules.map(m => m._id);

     const allLessons: ILesson[] = await Lesson.find({
          moduleId: { $in: moduleIds },
          isDeleted: false,
     }).sort({ orderNumber: 1 });

     // Group lessons by moduleId for easy access
     const lessonsByModule = allLessons.reduce((acc, lesson) => {
          const key = lesson.moduleId.toString();
          if (!acc[key]) acc[key] = [];
          
          acc[key].push(lesson);
          
          return acc;
     }, {} as Record<string, ILesson[]>);

     const firstModuleId = adminModules[0]?._id.toString();


     /*-─────────────────────────────────
     |  Prepare ModuleProgress for bulk insert
     |  First module → unlocked, rest → locked
     └──────────────────────────────────*/
     const moduleProgressDocs: IAdminModuleProgress[] = adminModules.map((module, index) => ({
          moduleId: module._id,
          capsuleId: adminCapsuleId,
          studentId: user.userId,
          totalLessons: lessonsByModule[module._id]?.length || 0, // module.numberOfLessons,
          status: index === 0 ? TAdminModuleProgress.inProgress : TAdminModuleProgress.locked,
          completedLessonsCount: 0,
     }));

     /*-─────────────────────────────────
     |  prepare Admin Module Progress for bulk insert
     └──────────────────────────────────*/
     /*---------
     const adminModuleProgresss : IAdminModuleProgress[] = adminModules.map((adminModule : IAdminModules) => ({
          moduleId : adminModule._id,
          capsuleId : adminCapsuleId,
          studentId : user.userId,
          totalLessons : adminModule.numberOfLessons, // but sure na .. 
          status : TAdminModuleProgress.notStarted, 
          completedLessonsCount : 0,
     }))
     -----------*/


     /*-─────────────────────────────────
     |  Prepare LessonProgress for bulk insert
     |  First lesson of first module → unlocked
     |  Everything else → locked
     └──────────────────────────────────*/
     const lessonProgressDocs: ILessonProgress[] = allLessons.map((lesson, index) => {
          const isFirstModule = lesson.moduleId.toString() === firstModuleId;
          const lessonsInFirstModule = lessonsByModule[firstModuleId] ?? [];
          const isFirstLesson = isFirstModule && lesson._id.toString() === lessonsInFirstModule[0]?._id.toString();

          return {
               lessonId: lesson._id,
               moduleId: lesson.moduleId,
               capsuleId: adminCapsuleId,
               studentId: user.userId,
               status: isFirstLesson ? TLessonProgress.unlocked : TLessonProgress.locked,
          };
     });
     
     // const res = await AdminModuleProgress.insertMany(adminModuleProgresss);

     // Bulk insert both in parallel
     await Promise.all([
          AdminModuleProgress.insertMany(moduleProgressDocs),
          LessonProgress.insertMany(lessonProgressDocs),
     ]);


     const updatedPurchasedAdminCapsule : IPurchasedAdminCapsule = await PurchasedAdminCapsule.findByIdAndUpdate(purchasedAdminCapsuleId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: TPaymentStatus.completed,
          totalLessons : allLessons.length || 0,
          totalModule : adminModules.length || 0,
          completedLessons : 0,
          completedModules : 0,
     }, { new: true });

     console.log("updatedPurchasedAdminCapsule :: ", updatedPurchasedAdminCapsule);


     /*-─────────────────────────────────
          ## State at Purchase Time
          Module 1  → unlocked   ← student can start
          Lesson 1 → unlocked  ← only this one is accessible
          Lesson 2 → locked
          Lesson 3 → locked

          Module 2  → locked
          Lesson 1 → locked
          Lesson 2 → locked

          Module 3  → locked
          ...


          ## Unlock Chain (when student completes a lesson)

          Complete Lesson 1 of Module 1
          → LessonProgress[lesson1] = completed
          → Unlock LessonProgress[lesson2] of Module 1

          Complete last Lesson of Module 1
          → ModuleProgress[module1] = completed
          → Unlock ModuleProgress[module2]
          → Unlock LessonProgress[first lesson of module2]
     └──────────────────────────────────*/

     /*-─────────────────────────────────
     | // TODO  notification e click korle kon page e jabe .. chinta korte hobe .. payment txn page e jabe ? naki capsule booking page e jabe ? naki original capsule e jabe ?
     └──────────────────────────────────*/
     await enqueueWebNotification(
          `A Student ${user.userId} ${user.userName} purchased a capsule, TxnId : ${paymentTransactionId}`,
          user.userId, // senderId
          null, // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.purchasedAdminCapsule, // type
          //---------------------------------
          // In UI there is a details page for order in admin end 
          //---------------------------------
          '', // linkFor // TODO : MUST add the query params 
          purchasedAdminCapsuleId, // linkId
          // TTransactionFor.TrainingProgramPurchase, // referenceFor
          // purchaseTrainingProgram._id // referenceId
     );

     return updatedPurchasedAdminCapsule;
}