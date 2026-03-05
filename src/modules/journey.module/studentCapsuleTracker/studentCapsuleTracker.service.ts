import { StatusCodes } from 'http-status-codes';
import { StudentCapsuleTracker } from './studentCapsuleTracker.model';
import { IStudentCapsuleTracker } from './studentCapsuleTracker.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { TCurrentSection, TTrackerStatus } from './studentCapsuleTracker.constant';
import { StudentModuleTracker } from '../studentModuleTracker/studentModuleTracker.model';
import { IModule } from '../module/module.interface';
import { Module } from '../module/module.model';
import { IStudentModuleTracker } from '../studentModuleTracker/studentModuleTracker.interface';
import { TStudentModuleTrackerStatus } from '../studentModuleTracker/studentModuleTracker.constant';
import { PaginateOptions } from '../../../types/paginate';
import mongoose from 'mongoose';
import { Question } from '../question/question.model';
import PaginationService from '../../../common/service/paginationService';
import { StudentAnswer } from '../studentAnswer/studentAnswer.model';
import { TStudentAnswerStatus } from '../studentAnswer/studentAnswer.constant';
import { IStudentAnswer } from '../studentAnswer/studentAnswer.interface';


export class StudentCapsuleTrackerService extends GenericService<
  typeof StudentCapsuleTracker,
  IStudentCapsuleTracker
> {
  constructor() {
    super(StudentCapsuleTracker);
  }

  /*-─────────────────────────────────  
  | ⚠️ NEED_OPTIMIZATION -> different different update er jonno different different service create kora lagbe .. 
  | ⚠️ NEED_OPTIMIZATION -> also this code is not senior level optimized 
  |  update status and calculate progressPercentage and update overAllStatus
  └──────────────────────────────────*/
  async updateByIdV2(id: string, data: Partial<IStudentCapsuleTracker>, studentId:string) {
    const object:IStudentCapsuleTracker = await StudentCapsuleTracker.findById(id).select('-__v');
    if (!object) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Object Found');
    }

    // Define section keys and total count
    const SECTION_KEYS = [
      "introStatus",
      "inspirationStatus",
      "diagnosticsStatus",
      "scienceStatus",
      "aiSummaryStatus",
    ] as const;

    const TOTAL_SECTIONS = SECTION_KEYS.length;

    // Create merged state: prioritize incoming data over existing values
    const mergedState = {
      introStatus: data.introStatus ?? object.introStatus,
      inspirationStatus: data.inspirationStatus ?? object.inspirationStatus,
      diagnosticsStatus: data.diagnosticsStatus ?? object.diagnosticsStatus,
      scienceStatus: data.scienceStatus ?? object.scienceStatus,
      aiSummaryStatus: data.aiSummaryStatus ?? object.aiSummaryStatus,
    };

    // Calculate progress percentage (only "completed" counts)
    const completedCount = SECTION_KEYS.filter(
      key => mergedState[key] === TTrackerStatus.completed
    ).length;
    
    const progressPercentage = Math.round((completedCount / TOTAL_SECTIONS) * 100);

    
    //─────────────────────────────────
    // Calculate overall status logic:
    // - "completed" ONLY if ALL sections are completed
    // - "notStarted" ONLY if ALL sections are notStarted
    // - Otherwise "inProgress" (even if mix of notStarted/inProgress/completed)
    //──────────────────────────────────
    let overallStatus: TTrackerStatus;
    
    if (completedCount === TOTAL_SECTIONS) {
      overallStatus = TTrackerStatus.completed;
    } else if (SECTION_KEYS.every(
      key => mergedState[key] === TTrackerStatus.notStarted
    )) {
      overallStatus = TTrackerStatus.notStarted;
    } else {
      overallStatus = TTrackerStatus.inProgress;
    }

    // Prepare update payload with computed fields
    const updatePayload = {
      ...data,
      progressPercentage,
      overallStatus,
    };


    /*-─────────────────────────────────
    | if 'currentSection' is not 'inspiration' but students next section is 'inspiration'
    | |->
    |  If modules found for this capsule .. but module tracker is not generated for this student ..
    |  then we need to generate student module tracker
    └──────────────────────────────────*/
    if(data.currentSection == TCurrentSection.inspiration && object.currentSection != TCurrentSection.inspiration){
    
      // check module tracker is generated or not for this student
      const isStudentModuleTrackersFound = await StudentModuleTracker.exists(
        {
          studentId : studentId,
          capsuleId : object.capsuleId,
        }
      );

      if(!isStudentModuleTrackersFound){
        /*-─────────────────────────────────
        |  need to generate studentModuleTracker for this student
        |  get all modules for this capsule 
        └──────────────────────────────────*/
        const modules: IModule[] = await Module.find({
          capsuleId : object.capsuleId,
        })

        // prepare studentModuleTracker for batch update
        const studentModuleTrackers : IStudentModuleTracker[] = modules.map((module : IModule) => ({
          studentId,
          moduleId : module._id,
          status : TStudentModuleTrackerStatus.notStarted,
          capsuleId : module.capsuleId,
        })) 

        const res = await StudentModuleTracker.insertMany(studentModuleTrackers);
      }

    }

    return await this.model.findByIdAndUpdate(
      id, 
      updatePayload,
      { new: true, runValidators: true }
    ).select('-__v');
  }


  async getModulesWithTrackerInfo(capsuleId : string, studentId : string){
    
    const moduleTrackers : IStudentModuleTracker = await StudentModuleTracker.find({
      capsuleId : capsuleId,
      studentId : studentId,
      isDeleted: false,
    }).select("moduleId status capsuleId").populate({
      path : "moduleId",
      select: "title description attachments estimatedTime",
      populate:{
        path: "attachments",
        select: "attachment"
      }
    });

    // get capsule tracker info also for this student 

    const capsuleTracker:IStudentCapsuleTracker = await StudentCapsuleTracker.findOne({
      capsuleId ,
      studentId,
      isDeleted: false,
    }).select("-isDeleted -capsuleNumber -__v -createdAt -updatedAt -capsuleId -title -studentId")

    return {
      moduleTrackers,
      capsuleTracker
    }

  }

  async updateModuleTracker(capsuleId: string, studentModuleTrackerId: string, data: Partial<IStudentModuleTracker>) {
    // 1. Update the module tracker
    const updatedModuleTracker: IStudentModuleTracker = await StudentModuleTracker.findByIdAndUpdate(
      studentModuleTrackerId,
      { status: data.status },
      { new: true }
    );

    if (!updatedModuleTracker) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No Module Tracker Found');
    }

    // 2. Check if ALL module trackers for this capsule + student are completed
    const [totalCount, completedCount] = await Promise.all([
      StudentModuleTracker.countDocuments({
        capsuleId,
        studentId: updatedModuleTracker.studentId,
      }),
      StudentModuleTracker.countDocuments({
        capsuleId,
        studentId: updatedModuleTracker.studentId,
        status: TStudentModuleTrackerStatus.completed,
      }),
    ]);

    const allCompleted : boolean = totalCount > 0 && totalCount === completedCount;

    // 3. Update inspirationStatus on the capsule tracker accordingly
    const updatedStudentCapsuleTracker : IStudentCapsuleTracker =  await StudentCapsuleTracker.findOneAndUpdate(
      {
        capsuleId,
        studentId: updatedModuleTracker.studentId,
      },
      {
        inspirationStatus: allCompleted
          ? TTrackerStatus.completed
          : TTrackerStatus.inProgress,
      }
    );

    return updatedModuleTracker;
  }

  async getQuestionsWithAnswersWithCapsuleTrackerInfo(
    filters: any, // Partial<INotification> // FixMe : fix type
    options: PaginateOptions,
    studentId : string,
    capsuleId : string,
    populateOptions?: any,
    select ? : string | string[],
  ){
    const matchStage: any = {};

    // Dynamically apply filters
    for (const key in filters) {

      const value = filters[key];

      if (value === '' || value === null || value === undefined) continue;

      // --- Match for Users collection ---
      if (['capsuleId', '_id'].includes(key)) {
        if (key === 'capsuleId') {
          matchStage[key] = new mongoose.Types.ObjectId(value);
        }
        else if (Array.isArray(value)) {
          matchStage[key] = { $in: value };
        }else if (key == '_id') {
          matchStage[key] = new mongoose.Types.ObjectId(value);
        } else {
          matchStage[key] = value;
        }
      }
    }

    matchStage.capsuleId = new mongoose.Types.ObjectId(capsuleId)

    const pipeline = [

      // Step 1: Filter questions by capsuleId
      { $match: matchStage },

      // Step 2: Lookup answers for each question by questionId + studentId
      {
        $lookup: {
          from: 'studentanswers', // your answers collection name
          let: { questionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$questionId', '$$questionId'] },
                    { $eq: ['$studentId', new mongoose.Types.ObjectId(studentId)] },
                  ],
                },
              },
            },
          ],
          as: 'studentAnswers',
        },
      },

      // Step 3: Unwind answers (preserveNull so unanswered questions still appear)
      {
        $unwind: {
          path: '$studentAnswers',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Step 4: Project required fields
      {
        $project: {
          _id: 1,
          capsuleId: 1,
          questionText: 1,
          questionType: 1,
          options: 1,
          createdAt: 1,

          // Answer fields
          answer: '$studentAnswers.answer',
          answeredAt: '$studentAnswers.createdAt',
          isAnswered: {
            $cond: {
              if: { $ifNull: ['$studentAnswers._id', false] },
              then: true,
              else: false,
            },
          },
        },
      },
    ];

    const res = await PaginationService.aggregationPaginate(
      Question, // your Question model
      pipeline,
      options,
    );

    return res;

  }

  async autoSaveAnswer(capsuleId: string, answer:string, questionId:string, studentId:string) {
    
    const savedAnswer = await StudentAnswer.findOneAndUpdate(
      // 🔍 Find by these fields
      {
        studentId: new mongoose.Types.ObjectId(studentId),
        questionId: new mongoose.Types.ObjectId(questionId),
      },
      // ✏️ Update these fields
      {
        $set: {
          answer,
          capsuleId,
          status: TStudentAnswerStatus.completed, // not 'submitted' yet
          isAnswered : true,
        },
      },
      // ⚙️ Options
      {
        upsert: true,       // create if not found
        new: true,          // return updated doc
        // runValidators: true,
      }
    );

    return savedAnswer;
  }

  async getOrGenerateAISummaryWithPurchasedJourneyStatus(){
    
  }

}
