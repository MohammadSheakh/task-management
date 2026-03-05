import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Lesson } from './lesson.model';
import { ILesson } from './lesson.interface';
import { LessonService } from './lesson.service';

export class LessonController extends GenericController<
  typeof Lesson,
  ILesson
> {
  LessonService = new LessonService();

  constructor() {
    super(new LessonService(), 'Lesson');
  }

  // add more methods here if needed or override the existing ones 
}
