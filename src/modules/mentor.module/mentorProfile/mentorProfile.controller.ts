import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { MentorProfile } from './mentorProfile.model';
import { IMentorProfile } from './mentorProfile.interface';
import { MentorProfileService } from './mentorProfile.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

export class MentorProfileController extends GenericController<
  typeof MentorProfile,
  IMentorProfile
> {
  mentorProfileService = new MentorProfileService();

  constructor() {
    super(new MentorProfileService(), 'MentorProfile');
  }

  // we create mentor profile while mentor register .. now we just update mentor profile information
  updateMentorProfile = catchAsync(async (req: Request, res: Response) => {
    const data:any = req.body;

    const mentorId = req.user.userId;

    const result = await this.mentorProfileService.updateMentorProfileV2(data, mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  });

  requestForAdminApproval = catchAsync(async (req: Request, res: Response) => {
    
    const mentorId = req.user.userId;

    const result = await this.mentorProfileService.changeStatusOfHaveAdminApproval( mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  });


  checkStatusOfHaveAdminApproval = catchAsync(async (req: Request, res: Response) => {
    
    const mentorId = req.user.userId;

    const result = await this.mentorProfileService.checkStatusOfHaveAdminApproval( mentorId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `haveAdminApproval and isLive status retrived successfully.`,
      success: true,
    });
  });

  mentorProfileInfoWithReviews = catchAsync(async (req: Request, res: Response) => {
    
    const mentorId = req.params.mentorId;

    // const result = await this.mentorProfileService.mentorProfileInfoWithReviews(mentorId);

    const result = await this.mentorProfileService.mentorProfileInfoWithReviewsV2(mentorId);

    


    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Mentor details with reviews retrived successfully.`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
