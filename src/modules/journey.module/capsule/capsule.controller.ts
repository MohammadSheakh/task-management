import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Capsule } from './capsule.model';
import { ICapsule } from './capsule.interface';
import { CapsuleService } from './capsule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import omit from '../../../shared/omit';

export class CapsuleController extends GenericController<
  typeof Capsule,
  ICapsule
> {
  capsuleService = new CapsuleService();

  constructor() {
    super(new CapsuleService(), 'Capsule');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data:ICapsule = req.body;

    data.capsuleNumber = await Capsule.countDocuments({ journeyId: data.journeyId }) + 1;

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getModulesAndQuestionsByCapsuleId = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
      
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.capsuleService.getModulesAndQuestionsByCapsuleId(filters,options);

    console.log("result", result )

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  })

  // add more methods here if needed or override the existing ones 
}
