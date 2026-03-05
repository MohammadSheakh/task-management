import { StatusCodes } from 'http-status-codes';
import { MentorCategory } from './mentorCategory.model';
import { IMentorCategory } from './mentorCategory.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class MentorCategoryService extends GenericService<
  typeof MentorCategory,
  IMentorCategory
> {
  constructor() {
    super(MentorCategory);
  }
}
