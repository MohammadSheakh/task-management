import { StatusCodes } from 'http-status-codes';
import { AdminModuleProgress } from './adminModuleProgress.model';
import { IAdminModuleProgress } from './adminModuleProgress.interface';
import { GenericService } from '../../_generic-module/generic.services';
import mongoose from 'mongoose';
import { Lesson } from '../lesson/lesson.model';
import { LessonProgress } from '../lessonProgress/lessonProgress.model';
import { TLessonProgress } from '../lessonProgress/lessonProgress.constant';
import { ILessonProgress } from '../lessonProgress/lessonProgress.interface';
import { TAdminModuleProgress } from './adminModuleProgress.constant';
import { PurchasedAdminCapsule } from '../purchasedAdminCapsule/purchasedAdminCapsule.model';
import { AdminModules } from '../adminModules/adminModules.model';
import { ILesson } from '../lesson/lesson.interface';
import { IAdminModules } from '../adminModules/adminModules.interface';
import { TPurchasedAdminCapsuleStatus } from '../purchasedAdminCapsule/purchasedAdminCapsule.constant';
import { IPurchasedAdminCapsule } from '../purchasedAdminCapsule/purchasedAdminCapsule.interface';

export class AdminModuleProgressService extends GenericService<
  typeof AdminModuleProgress,
  IAdminModuleProgress
> {
  constructor() {
    super(AdminModuleProgress);
  }


  async getModuleProgressByCapsule(capsuleId: string, studentId: string) {
    return await AdminModuleProgress.aggregate(
    [
      // Step 1: Match this student's module progress for this capsule
      {
        $match: {
          capsuleId: new mongoose.Types.ObjectId(capsuleId),
          studentId: new mongoose.Types.ObjectId(studentId),
        },
      },

      //-------------------------------------------

      {
        $lookup: {
          from: 'purchasedadmincapsules',
          let: { capsuleId: new mongoose.Types.ObjectId(capsuleId) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$capsuleId', '$$capsuleId'] },
                    { $eq: ['$studentId', new mongoose.Types.ObjectId(studentId)] }
                  ]
                }
              }
            }
          ],
          as: 'purchaseInfo'
        }
      },
      {
        $unwind: {
          path: '$purchaseInfo',
          preserveNullAndEmptyArrays: true
        }
      },


      // -------------------------------------------



      // Step 2: Join with Module to get title, description, orderNumber
      {
        $lookup: {
          from: 'adminmodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'moduleInfo',
        },
      },
      { $unwind: '$moduleInfo' },

      
      // Step 3: Join LessonProgress for this module + student
      {
        $lookup: {
          from: 'lessonprogresses',
          let: { moduleId: '$moduleId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$moduleId', '$$moduleId'] },
                    { $eq: ['$studentId', new mongoose.Types.ObjectId(studentId)] },
                  ],
                },
              },
            },

            

            // Join each lessonProgress with Lesson to get title, duration, orderNumber
            {
              $lookup: {
                from: 'lessons',
                localField: 'lessonId',
                foreignField: '_id',
                as: 'lessonInfo',
              },
            },
            { $unwind: '$lessonInfo' },

            // Sort lessons by orderNumber
            { $sort: { 'lessonInfo.orderNumber': 1 } },

            { //--------------------- populate attachments of lessonInfo
              $lookup: {
                from: 'attachments',
                localField: 'lessonInfo.attachments',
                foreignField: '_id',
                as: 'lessonInfo.attachments',
              },
            },
            

            {
              $project: {
                _id: 1,
                lessonId: 1,
                status: 1,
                lastViewedAt: 1,
                completedAt: 1,
                // Lesson content fields
                title: '$lessonInfo.title',
                estimatedTime: '$lessonInfo.estimatedTime',
                orderNumber: '$lessonInfo.orderNumber',
                // attachments: '$lessonInfo.attachments',
                attachments: {  //🆕
                  $map: {
                    input: '$lessonInfo.attachments',
                    as: 'att',
                    in: '$$att.attachment',
                  },
                },
              },
            },
          ],
          as: 'lessons',
        },
      },
      

      // Step 4: Sort modules by orderNumber
      { $sort: { 'moduleInfo.orderNumber': 1 } },

      // Step 5: Project final shape
      {
        $project: {
          _id: 1,
          moduleId: 1,
          status: 1,
          completedLessonsCount: 1,
          totalLessons: 1,
          // Module content fields
          title: '$moduleInfo.title',
          description: '$moduleInfo.description',
          orderNumber: '$moduleInfo.orderNumber',
          // Nested lessons with their progress
          lessons: 1,

          //=================================

          purchase: {
            status: '$purchaseInfo.status',
            paymentStatus: '$purchaseInfo.paymentStatus',

            progressPercent: '$purchaseInfo.progressPercent',
            
            completedModules: '$purchaseInfo.completedModules',
            totalModules: '$purchaseInfo.totalModules',
            totalLessons: '$purchaseInfo.totalLessons',
            completedLessons: '$purchaseInfo.completedLessons',
            isCertificateUploaded: '$purchaseInfo.isCertificateUploaded',

            isGifted : '$purchaseInfo.isGifted',
          }

        },
      },
    ]);
  }

  // 🧱 
  async completeLesson(
    lessonProgressId: string,
    lessonId: string,
    studentId: string,
    capsuleId: string,  // ✅ Added capsuleId parameter
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
      const lessonProgressObjectId = new mongoose.Types.ObjectId(lessonProgressId);
      const studentObjectId = new mongoose.Types.ObjectId(studentId);
      const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

      /* -----------------------------------------
        1️⃣ Load lesson
      ------------------------------------------ */
      const lesson: ILesson = await Lesson.findById(lessonObjectId)
        .session(session)
        .lean();

      if (!lesson) throw new Error('Lesson not found');

      /* -----------------------------------------
        2️⃣ Mark lesson completed ONLY IF NOT completed  ☑️
      ------------------------------------------ */
      const updatedLessonProgress: ILessonProgress =
        await LessonProgress.findOneAndUpdate(
          {
            _id: lessonProgressObjectId,  // ✅ FIXED: Query by progress doc _id
            studentId: studentObjectId,
            capsuleId: capsuleObjectId,    // ✅ ADDED: Data isolation
            status: { $ne: TLessonProgress.completed },
          },
          {
            $set: {
              status: TLessonProgress.completed,
              completedAt: new Date(),
            },
          },
          {
            new: true,
            session,
          }
        );

      // 🔥 If null → already completed → safe exit  ☑️
      if (!updatedLessonProgress) {
        await session.commitTransaction();
        session.endSession();
        return { message: 'Lesson already completed (idempotent)' };
      }else{

        console.log("hit ⚡⚡");
        
        // if one lesson is completed .. then we need to update "completedLessons" count
        const updateCompleteLessonCount : IPurchasedAdminCapsule = await PurchasedAdminCapsule.findOneAndUpdate(
          {
            capsuleId: capsuleObjectId,
            studentId: studentObjectId,
          },
          { 
            $inc: { completedLessons: 1 },
          },
          { session }
        );

        console.log("updateCompleteLessonCount :: ", updateCompleteLessonCount);
      }

      /* -----------------------------------------
        3️⃣ Increment module completedLessonsCount safely ☑️
      ------------------------------------------ */
      await AdminModuleProgress.updateOne(
        {
          moduleId: updatedLessonProgress.moduleId,
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,  // ✅ ADDED
        },
        {
          $inc: { completedLessonsCount: 1 },
          $set: { status: TAdminModuleProgress.inProgress },
        },
        { session }
      );

      /* -----------------------------------------
        4️⃣ Find next lesson in SAME module
      ------------------------------------------ */
      const nextLessonDef : ILesson = await Lesson.findOne({
        moduleId: updatedLessonProgress.moduleId,
        orderNumber: { $gt: lesson.orderNumber },
      })
        .sort({ orderNumber: 1 })
        .session(session);

      console.log("nextLessonDef :: ", nextLessonDef)

      if (nextLessonDef) {
        // ✅ FIXED: Upsert lesson progress for next lesson
        const lessonProgressUpdatedRes : ILessonProgress = await LessonProgress.findOneAndUpdate(
          {
            capsuleId: capsuleObjectId,
            studentId: studentObjectId,
            lessonId: nextLessonDef._id,  // ✅ Use lesson _id
          },
          {
            $set: {
              status: TLessonProgress.unlocked
            },
          },
          { session, upsert: true, new : true }
        );

        console.log("lessonProgressUpdatedRes  :: ", lessonProgressUpdatedRes);

        await session.commitTransaction();
        session.endSession();
        return { 
          message: 'Lesson completed, next lesson unlocked',
          nextLessonId: nextLessonDef._id 
        };
      }

      /* -----------------------------------------
        5️⃣ No next lesson → complete module
      ------------------------------------------ */
      await AdminModuleProgress.updateOne(
        {
          moduleId: lesson.moduleId,
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
        },
        { $set: { 
          
          status: TAdminModuleProgress.completed
        } },
        { session }
      );

      // update completed module count 
      await PurchasedAdminCapsule.findOneAndUpdate(
          {
            capsuleId: capsuleObjectId,
            studentId: studentObjectId,
          },
          { 
            $inc: { completedModules: 1 }, //////////////////////////////
          },
          { session }
        );

      const currentModule: IAdminModules = await AdminModules.findById(lesson.moduleId)
        .session(session)
        .lean();

      if (!currentModule) {
        throw new Error('Module not found');
      }

      const nextModule: IAdminModules | null = await AdminModules.findOne({
        capsuleId: currentModule.capsuleId,
        orderNumber: { $gt: currentModule.orderNumber },
      })
        .sort({ orderNumber: 1 })
        .session(session);

      if (nextModule) {
        // Unlock next module
        await AdminModuleProgress.updateOne(
          {
            moduleId: nextModule._id,
            studentId: studentObjectId,
            capsuleId: capsuleObjectId,
          },
          { 
            $set: { 
              status: TAdminModuleProgress.inProgress,
              createdAt: new Date()
            } 
          },
          { session, upsert: true }
        );

        // Find and unlock first lesson of next module
        const firstLesson: ILesson | null = await Lesson.findOne({
          moduleId: nextModule._id,
        })
          .sort({ orderNumber: 1 })
          .session(session);

        if (firstLesson) {
          await LessonProgress.updateOne(
            {
              capsuleId: capsuleObjectId,
              studentId: studentObjectId,
              lessonId: firstLesson._id,  // ✅ Use lesson _id
            },
            {
              $setOnInsert: {
                status: TLessonProgress.unlocked,
                moduleId: firstLesson.moduleId,
                orderNumber: firstLesson.orderNumber,
                createdAt: new Date(),
              },
            },
            { session, upsert: true }
          );
        }

        await session.commitTransaction();
        session.endSession();
        return { 
          message: 'Module completed, next module unlocked',
          nextModuleId: nextModule._id,
          firstLessonId: firstLesson?._id 
        };
      }

      /* -----------------------------------------
        6️⃣ No next module → complete capsule
      ------------------------------------------ */
      await PurchasedAdminCapsule.findOneAndUpdate(
        {
          capsuleId: capsuleObjectId,
          studentId: studentObjectId,
        },
        { 
          $set: { 
            $inc: { completedModules: 1 }, /////////////////
            status: TPurchasedAdminCapsuleStatus.complete,
            completedAt: new Date()
          } 
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return { 
        message: 'Capsule completed 🎉',
        capsuleId: capsuleObjectId 
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}