import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { MentorCategory } from './mentorCategory.model';
import { IMentorCategory } from './mentorCategory.interface';
import { MentorCategoryService } from './mentorCategory.service';

export class MentorCategoryController extends GenericController<
  typeof MentorCategory,
  IMentorCategory
> {
  MentorCategoryService = new MentorCategoryService();

  constructor() {
    super(new MentorCategoryService(), 'MentorCategory');
  }

  // add more methods here if needed or override the existing ones 
}
