import { StatusCodes } from 'http-status-codes';
import { LessonProgress } from './lessonProgress.model';
import { ILessonProgress } from './lessonProgress.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class LessonProgressService extends GenericService<
  typeof LessonProgress,
  ILessonProgress
> {
  constructor() {
    super(LessonProgress);
  }
}
