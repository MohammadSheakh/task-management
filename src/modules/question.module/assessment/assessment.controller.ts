import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Assessment } from './assessment.model';
import { IAssessment } from './assessment.interface';
import { AssessmentService } from './assessment.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

export class AssessmentController extends GenericController<
  typeof Assessment,
  IAssessment
> {
  assessmentService = new AssessmentService();

  constructor() {
    super(new AssessmentService(), 'Assessment');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data:IAssessment = req.body;
    data.userId = req.user.userId;

    const result = await this.assessmentService.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
