//@ts-ignore
import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { AttachmentRoutes } from '../modules/attachments/attachment.route';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { ConversationRoute } from '../modules/chatting.module/conversation/conversation.route';
import { MessageRoute } from '../modules/chatting.module/message/message.route';
import { PaymentTransactionRoute } from '../modules/payment.module/paymentTransaction/paymentTransaction.route';
import stripeAccountRoutes from '../modules/payment.module/stripeAccount/stripeAccount.route';
import { UserRoutes } from '../modules/user.module/user/user.route';
import { WalletTransactionHistoryRoute } from '../modules/wallet.module/walletTransactionHistory/walletTransactionHistory.route';
import { BankInfoRoute } from '../modules/wallet.module/bankInfo/bankInfo.route';
import { WithdrawalRequstRoute } from '../modules/wallet.module/withdrawalRequst/withdrawalRequst.route';

import { SettingsRoutes } from '../modules/settings.module/settings/settings.routes';
import { PhaseRoute } from '../modules/question.module/phase/phase.route';
import { QuestionRoute } from '../modules/question.module/question/question.route';
import { JourneyRoute } from '../modules/journey.module/journey/journey.route';
import { CapsuleRoute } from '../modules/journey.module/capsule/capsule.route';
import { ModuleRoute } from '../modules/journey.module/module/module.route';
import { QuestionRoute as JourneyQuestionRoute } from '../modules/journey.module/question/question.route';
import { AdminCapsuleCategoryRoute } from '../modules/adminCapsule.module/adminCapsuleCategory/adminCapsuleCategory.route';
import { AdminCapsuleRoute } from '../modules/adminCapsule.module/adminCapsule/adminCapsule.route';
import { AdminModulesRoute } from '../modules/adminCapsule.module/adminModules/adminModules.route';
import { LessonRoute } from '../modules/adminCapsule.module/lesson/lesson.route';
import { FaqCategoryRoute } from '../modules/settings.module/faqCategory/faqCategory.route';
import { FaqRoute } from '../modules/settings.module/faq/faq.route';
import { CalendlyRoute } from '../modules/calendly.module/calendly/calendly.route';
import { AdminCapsuleReviewRoute } from '../modules/review.module/adminCapsuleReview/adminCapsuleReview.route';
import { MentorReviewRoute } from '../modules/review.module/mentorReview/mentorReview.route';
import { PurchasedJourneyRoute } from '../modules/journey.module/purchasedJourney/purchasedJourney.route';
import { StudentCapsuleTrackerRoute } from '../modules/journey.module/studentCapsuleTracker/studentCapsuleTracker.route';
import { PurchasedAdminCapsuleRoute } from '../modules/adminCapsule.module/purchasedAdminCapsule/purchasedAdminCapsule.route';
import { AdminModuleProgressRoute } from '../modules/adminCapsule.module/adminModuleProgress/adminModuleProgress.route';
import { AssessmentRoute } from '../modules/question.module/assessment/assessment.route';
import { MentorProfileRoute } from '../modules/mentor.module/mentorProfile/mentorProfile.route';
import { TaskRoute } from '../modules/task.module/task/task.route';
import { SubTaskRoute } from '../modules/task.module/subTask/subTask.route';
import { GroupRoute } from '../modules/group.module/group/group.route';
import { GroupMemberRoute } from '../modules/group.module/groupMember/groupMember.route';
import { NotificationRoute } from '../modules/notification.module/notification/notification.route';
import { TaskReminderRoute } from '../modules/notification.module/taskReminder/taskReminder.route';
import { AnalyticsRoutes } from '../modules/analytics.module/analytics.route';
import { ChildrenBusinessUserRoute } from '../modules/childrenBusinessUser.module/childrenBusinessUser.route';

// import { ChatRoutes } from '../modules/chat/chat.routes';
// import { MessageRoutes } from '../modules/message/message.routes';
const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },

  /////////////////////////////////////////  Task Management
  { // 🟢
    path: '/tasks',
    route: TaskRoute,
  },
  { // 🟢
    path: '/subtasks',
    route: SubTaskRoute,
  },

  /////////////////////////////////////////  Group/Team Management
  { // 🟢
    path: '/groups',
    route: GroupRoute,
  },
  { // 🟢
    path: '/group-members',
    route: GroupMemberRoute,
  },

  /////////////////////////////////////////  Notification & Reminders
  { // 🟢
    path: '/notifications',
    route: NotificationRoute,
  },
  { // 🟢
    path: '/task-reminders',
    route: TaskReminderRoute,
  },

  /////////////////////////////////////////  Analytics
  { // 🟢 NEW
    path: '/analytics',
    route: AnalyticsRoutes,
  },

  /////////////////////////////////////////  Children Business User
  { // 🟢 NEW - Business user can manage children accounts
    path: '/children-business-users',
    route: ChildrenBusinessUserRoute,
  },

  ////////////////////// Created By Mohammad Sheakh

  ///////////////////////////////////////// Question
  { // 🟢
    path: '/question-sections',
    route: PhaseRoute,
  },
  { // 🟢
    path: '/questions',
    route: QuestionRoute,
  },

  { // 🟢
    path: '/assessments',
    route: AssessmentRoute,
  },

  /////////////////////////////////////////  Calendly
  { // 🟢
    path: '/calendly',
    route: CalendlyRoute,
  },
  /////////////////////////////////////////  Journey
  { // 🟢
    path: '/journey',
    route: JourneyRoute,
  },
  { // 🟢
    path: '/purchased-journey',
    route: PurchasedJourneyRoute,
  },

  { // 🟢
    path: '/journey-capusule',
    route: CapsuleRoute,
  },

  { // 🟢
    path: '/capsule-modules',
    route: ModuleRoute,
  },
  { // 🟢
    path: '/capsule-questions',
    route: JourneyQuestionRoute,
  },

  { // 🟢
    path: '/student-capsule-trackers',
    route: StudentCapsuleTrackerRoute,
  },

  

  /////////////////////////////////////////  Mentor Review

  { // 🟢
    path: '/mentor-review',
    route: MentorReviewRoute,
  },

  { // 🟢
    path: '/mentor-profiles',
    route: MentorProfileRoute,
  },

  /////////////////////////////////////////  Admin Capsule
  { // 🟢
    path: '/admin-capsule-categories',
    route: AdminCapsuleCategoryRoute,
  },
  { // 🟢
    path: '/admin-capsules',
    route: AdminCapsuleRoute,
  },

  { // 🟢
    path: '/purchased-admin-capsule',
    route: PurchasedAdminCapsuleRoute,
  },
  { // 🟢
    path: '/admin-capsules-reviews',
    route: AdminCapsuleReviewRoute,
  },

  { // 🟢
    path: '/admin-modules',
    route: AdminModulesRoute,
  },
  {
    path : '/admin-lessons',
    route: LessonRoute,
  },
  {
    path : '/admin-module-progress',
    route: AdminModuleProgressRoute,
  },
  ///////////////////////////////////////// FAQ Category
  {
    path : '/faqCategory',
    route: FaqCategoryRoute,
  },
  {
    path : '/faq',
    route: FaqRoute,
  },

  ///////////////////////////////////////// Payment Transaction
  { // 🟢
    path: '/payment-transactions',
    route: PaymentTransactionRoute,
  },

  ///////////////////////////////////////// Chatting 
  { // 🟢
    path: '/conversations',
    route: ConversationRoute,
  },
  // { // 🟢
  //   path: '/information-videos',
  //   route: informationVideoRoute,
  // },
  ////////////////////////////////////////////  Person Relationship
  // { // 🟢
  //   path: '/doctor-appointments',
  //   route: DoctorAppointmentScheduleRoute,
  // },
  
  // { // 🟢
  //   path: '/doctor-appointments/bookings',
  //   route: DoctorPatientScheduleBookingRoute,
  // },

  ///////////////////////////////////////////// Admin Percentage
  // {
  //   path: '/admin-percentage',
  //   route: AdminPercentageRoute,
  // },
  
  ///////////////////////////////////////////// Service Booking
  // {
  //   path: '/service-bookings',
  //   route: ServiceBookingRoute,
  // },

  ///////////////////////////////////////////// Service Provider
  // {
  //   path: '/service-providers',
  //   route: ServiceProviderRoute,
  // },
  ///////////////////////////////////////////// Service Categories
  // {
  //   path: '/service-categories',
  //   route: ServiceCategoryRoute,
  // },
  ///////////////////////////////////////////// Settings And Contact Us
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  ///////////////////////////////////////////// Reviews

  {
    path: '/attachments',
    route: AttachmentRoutes,
  },
  {
    path: '/activitys',
    route: NotificationRoutes,
  },
  {
    path: '/messages',
    route: MessageRoute,
  },

  {
    path: '/payments',
    route: PaymentTransactionRoute,
  },

  //////////////////////////////////////// Subscription Or Purchase
  // {  // 🟢 from kappes
  //   path: '/stripe',
  //   route: stripeAccountRoutes,
  // },
  {  // 🟢 from kappes
    path: '/ssl',
    route: stripeAccountRoutes,
  },
  ///////////////////////////////////////////// Wallet
  { // 🟢
    path: '/wallet-transactions',
    route: WalletTransactionHistoryRoute,
  },
  { // 🟢
    path: '/withdrawal-requst',
    route: WithdrawalRequstRoute,
  },
  { // 🟢
    path: '/bank-info',
    route: BankInfoRoute,
  },
  // { // 🟢
  //   path: '/additional-cost',
  //   route: AdditionalCostRoute,
  // }
  
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
