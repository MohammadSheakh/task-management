import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { LessonProgress } from './lessonProgress.model';
import { ILessonProgress } from './lessonProgress.interface';
import { LessonProgressService } from './lessonProgress.service';

export class LessonProgressController extends GenericController<
  typeof LessonProgress,
  ILessonProgress
> {
  LessonProgressService = new LessonProgressService();

  constructor() {
    super(new LessonProgressService(), 'LessonProgress');
  }

  // add more methods here if needed or override the existing ones 
}
