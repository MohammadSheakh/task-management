import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AdminCapsuleReview } from './adminCapsuleReview.model';
import { IAdminCapsuleReview } from './adminCapsuleReview.interface';
import { AdminCapsuleReviewService } from './adminCapsuleReview.service';

export class AdminCapsuleReviewController extends GenericController<
  typeof AdminCapsuleReview,
  IAdminCapsuleReview
> {
  AdminCapsuleReviewService = new AdminCapsuleReviewService();

  constructor() {
    super(new AdminCapsuleReviewService(), 'AdminCapsuleReview');
  }

  // add more methods here if needed or override the existing ones 
}
