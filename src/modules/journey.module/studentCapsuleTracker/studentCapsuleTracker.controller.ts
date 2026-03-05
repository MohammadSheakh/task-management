import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { StudentCapsuleTracker } from './studentCapsuleTracker.model';
import { IStudentCapsuleTracker } from './studentCapsuleTracker.interface';
import { StudentCapsuleTrackerService } from './studentCapsuleTracker.service';
import catchAsync from '../../../shared/catchAsync';
import ApiError from '../../../errors/ApiError';
import sendResponse from '../../../shared/sendResponse';
import { StudentModuleTrackerService } from '../studentModuleTracker/studentModuleTracker.service';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';

export class StudentCapsuleTrackerController extends GenericController<
  typeof StudentCapsuleTracker,
  IStudentCapsuleTracker
> {
  studentCapsuleTrackerService = new StudentCapsuleTrackerService();
  studentModuleTrackerService = new StudentModuleTrackerService();

  constructor() {
    super(new StudentCapsuleTrackerService(), 'StudentCapsuleTracker');
  }

  // update status and calculate progressPercentage and update overAllStatus
  updateById = catchAsync(async (req: Request, res: Response) => {
    // if (!req.params.id) { //----- Better approach: validate ObjectId
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     `id is required for update ${this.modelName}`
    //   );
    // }
    
    const id = req.params.id;

    const updatedObject = await this.studentCapsuleTrackerService.updateByIdV2(id, req.body, req.user.userId); // pass studentId
    if (!updatedObject) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`
      );
    }
    //   return res.status(StatusCodes.OK).json(updatedObject);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `${this.modelName} updated successfully`,
    });
  });


  getModulesWithTrackerInfo = catchAsync(async (req: Request, res: Response) => {
  
    const updatedObject = await this.studentCapsuleTrackerService.getModulesWithTrackerInfo(req.params.capsuleId, req.user.userId); // pass studentId
    
    //   return res.status(StatusCodes.OK).json(updatedObject);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `${this.modelName} retrived successfully`,
    });
  });


  updateModuleTracker = catchAsync(async (req: Request, res: Response) => {
  
    /*-─────────────────────────────────
    |  when we update a modules status 'notStarted' -> 'completed'
    |  
    | we need to check if every modules status is completed or not 
    | if every studentModuleTracker's status is completed .. then 
    |
    | StudentCapsuleTracker's 'inspirationStatus' will be 'completed'
    └──────────────────────────────────*/
    const updatedObject = await this.studentCapsuleTrackerService.updateModuleTracker(req.params.capsuleId, req.params.studentModuleTrackerId, req.body);
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `Module tracker updated successfully`,
    });
  });


  getQuestionsWithAnswersWithCapsuleTrackerInfo = catchAsync(async (req: Request, res: Response) => {
  
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    // ✅ Default values
    let populateOptions: (string | { path: string; select: string }[]) = [];
    let select = '-isDeleted -createdAt -updatedAt -__v';

    // ✅ If middleware provided overrides → use them
    if (req.queryOptions) {
      if (req.queryOptions.populate) {
        populateOptions = req.queryOptions.populate;
      }
      if (req.queryOptions.select) {
        select = req.queryOptions.select;
      }
    }

    const updatedObject = await this.studentCapsuleTrackerService.getQuestionsWithAnswersWithCapsuleTrackerInfo(
      filters, options, req.user.userId, req.params.capsuleId, populateOptions, select); // here we pass studentId
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `Question with student's answer retrived successfully`,
    });
  });

  submitAnswerAutoSaveFeature = catchAsync(async (req: Request, res: Response) => {
  
    const updatedObject = await this.studentCapsuleTrackerService.autoSaveAnswer(
      req.body.capsuleId, req.body.answer, req.params.questionId, req.user.userId); // here we pass studentId
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `Question with student's answer retrived successfully`,
    });
  });


  getOrGenerateAISummaryWithPurchasedJourneyStatus = catchAsync(async (req: Request, res: Response) => {
  
    const updatedObject = await this.studentCapsuleTrackerService.getOrGenerateAISummaryWithPurchasedJourneyStatus(); // here we pass studentId
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `Question with student's answer retrived successfully`,
    });
  });

  // add more methods here if needed or override the existing ones 
}
