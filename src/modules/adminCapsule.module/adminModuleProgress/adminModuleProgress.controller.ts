import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AdminModuleProgress } from './adminModuleProgress.model';
import { IAdminModuleProgress } from './adminModuleProgress.interface';
import { AdminModuleProgressService } from './adminModuleProgress.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

export class AdminModuleProgressController extends GenericController<
  typeof AdminModuleProgress,
  IAdminModuleProgress
> {
  adminModuleProgressService = new AdminModuleProgressService();

  constructor() {
    super(new AdminModuleProgressService(), 'AdminModuleProgress');
  }

  getModuleProgressByCapsule = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId } = req.params;
    const studentId = req.user.userId; // from auth middleware

    const result = await this.adminModuleProgressService.getModuleProgressByCapsule(capsuleId, studentId);

    // console.log("result :: ", result);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Module progress fetched successfully',
    });
  });

  updateLessonStatus = catchAsync(async (req: Request, res: Response) => {
    const { lessonProgressId, lessonId, capsuleId } = req.params;

    const studentId = req.user.userId; // from auth middleware

    const result = await this.adminModuleProgressService.completeLesson(lessonProgressId, lessonId, studentId, capsuleId);

    // console.log("result :: ", result);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Module progress fetched successfully',
    });
  });

  // add more methods here if needed or override the existing ones 
}
