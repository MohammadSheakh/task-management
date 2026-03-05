import { StatusCodes } from 'http-status-codes';
import { AdminCapsuleReview } from './adminCapsuleReview.model';
import { IAdminCapsuleReview } from './adminCapsuleReview.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class AdminCapsuleReviewService extends GenericService<
  typeof AdminCapsuleReview,
  IAdminCapsuleReview
> {
  constructor() {
    super(AdminCapsuleReview);
  }
}
