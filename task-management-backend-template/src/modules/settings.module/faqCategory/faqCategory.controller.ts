import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { FaqCategory } from './faqCategory.model';
import { IFaqCategory } from './faqCategory.interface';
import { FaqCategoryService } from './faqCategory.service';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';

export class FaqCategoryController extends GenericController<
  typeof FaqCategory,
  IFaqCategory
> {
  faqCategoryService = new FaqCategoryService();

  constructor() {
    super(new FaqCategoryService(), 'FaqCategory');
  }


  getAllCategoriesWithItsFaqs = catchAsync(async (req: Request, res: Response) => {
    
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.faqCategoryService.getAllCategoriesWithFaqs(options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Retrive all faqCategories with all faq's successfully.`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
