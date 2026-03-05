import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Journey } from './journey.model';
import { IJourney } from './journey.interface';
import { JourneyService } from './journey.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import omit from '../../../shared/omit';

export class JourneyController extends GenericController<
  typeof Journey,
  IJourney
> {
  journeyService = new JourneyService();

  constructor() {
    super(new JourneyService(), 'Journey');
  }

  getJourneyDetailsWithCapsules = catchAsync(async (req: Request, res: Response) => {
    
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.journeyService.getJourneyDetailsWithCapsules(options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Journey details with capsules retrieved successfully`,
      success: true,
    });
  });

  isPurchasedByStudent = catchAsync(async (req: Request, res: Response) => {
    
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'capsuleId',
        select: 'capsuleNumber title roadMapBrief totalModule'  // may be description
      },
    ];

    const select = '-isDeleted -createdAt -updatedAt -__v'; 
    

    const result = await this.journeyService.isPurchasedByStudent(req.user.userId, filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Journey details with capsules retrieved successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}

