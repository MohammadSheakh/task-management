import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { MentorReview } from './mentorReview.model';
import { IMentorReview } from './mentorReview.interface';
import { MentorReviewService } from './mentorReview.service';

export class MentorReviewController extends GenericController<
  typeof MentorReview,
  IMentorReview
> {
  MentorReviewService = new MentorReviewService();

  constructor() {
    super(new MentorReviewService(), 'MentorReview');
  }

  // add more methods here if needed or override the existing ones 
}
