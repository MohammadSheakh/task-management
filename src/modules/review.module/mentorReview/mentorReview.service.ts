import { StatusCodes } from 'http-status-codes';
import { MentorReview } from './mentorReview.model';
import { IMentorReview } from './mentorReview.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class MentorReviewService extends GenericService<
  typeof MentorReview,
  IMentorReview
> {
  constructor() {
    super(MentorReview);
  }
}
