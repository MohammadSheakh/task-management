//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AdminCapsule } from './adminCapsule.model';
import { IAdminCapsule, ICreateAdminCapsuleWithTopics } from './adminCapsule.interface';
import { AdminCapsuleService } from './adminCapsule.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';

export class AdminCapsuleController extends GenericController<
  typeof AdminCapsule,
  IAdminCapsule
> {
  adminCapsuleService = new AdminCapsuleService();

  constructor() {
    super(new AdminCapsuleService(), 'AdminCapsule');
  }

  // TODO : proper object return korte hobe as per nirob vai .. 
  create = catchAsync(async (req: Request, res: Response) => {
    const data:ICreateAdminCapsuleWithTopics = req.body;
    const result = await this.adminCapsuleService.createV2(data, req.user.userId);// pass adminId here

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getAllModulesByCapsuleId = catchAsync(async (req: Request, res: Response) => {
    const { capsuleId } = req.params;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.adminCapsuleService.getAllModulesByCapsuleId(options, capsuleId);// pass adminId here

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getWithModulesAndReviews = catchAsync(async (req: Request, res: Response) => {
    const { adminCapsuleId } = req.params;

    const result = await this.adminCapsuleService.getWithModulesAndReviews(adminCapsuleId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
