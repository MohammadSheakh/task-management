import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AdminCapsuleCategory } from './adminCapsuleCategory.model';
import { IAdminCapsuleCategory } from './adminCapsuleCategory.interface';
import { AdminCapsuleCategoryService } from './adminCapsuleCategory.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import omit from '../../../shared/omit';

export class AdminCapsuleCategoryController extends GenericController<
  typeof AdminCapsuleCategory,
  IAdminCapsuleCategory
> {
  adminCapsuleCategoryService = new AdminCapsuleCategoryService();

  constructor() {
    super(new AdminCapsuleCategoryService(), 'AdminCapsuleCategory');
  }


  getAllCapsulesByCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { capsuleCategoryId } = req.params;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    
    // const result = await this.adminCapsuleCategoryService.getAllCapsulesByCategoryId(options, capsuleCategoryId);
    const result = await this.adminCapsuleCategoryService.getAllCapsulesByCategoryIdV2(options, capsuleCategoryId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `all admin capsules retrived successfully by categoryId`,
      success: true,
    });
  });


  getAllCapsulesWithRatingInfoByCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { capsuleCategoryId } = req.params;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    
    // const result = await this.adminCapsuleCategoryService.getAllCapsulesByCategoryId(options, capsuleCategoryId);
    const result = await this.adminCapsuleCategoryService.getAllCapsulesWithRatingInfoByCategoryIdV2WithCategoryInformation(options, capsuleCategoryId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `all admin capsules retrived successfully by categoryId`,
      success: true,
    });
  });

  getAllCapsulesWithRatingInfoByCategoryIdForStudent = catchAsync(async (req: Request, res: Response) => {
    const { capsuleCategoryId } = req.params;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    
    // const result = await this.adminCapsuleCategoryService.getAllCapsulesByCategoryId(options, capsuleCategoryId);
    const result = await this.adminCapsuleCategoryService.getAllCapsulesWithRatingInfoByCategoryIdV2(options, capsuleCategoryId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `all admin capsules retrived successfully by categoryId`,
      success: true,
    });
  });

  getAllCapsuleCategoryAndTopThreeMentorReview = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    

    const populateOptions: (string | {path: string, select: string}[]) = [
      // {
      //   path: 'personId',
      //   select: 'name ' 
      // },
      // 'personId'
      {
        path: 'attachments',
        select: 'attachment attachmentType publicId',
        // populate: {
        //   path: 'lastMessage',
        // }
      }
    ];

    const select = '-isDeleted -createdAt -updatedAt -__v'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions , select );

    // get top 3 review of mentor 
    const topThreeMentorReview = await this.adminCapsuleCategoryService.topThreeMentorReview();

    sendResponse(res, {
      code: StatusCodes.OK,
      data: {result, topThreeMentorReview},
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
