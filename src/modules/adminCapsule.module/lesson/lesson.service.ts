import { StatusCodes } from 'http-status-codes';
import { Lesson } from './lesson.model';
import { ILesson } from './lesson.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class LessonService extends GenericService<
  typeof Lesson,
  ILesson
> {
  constructor() {
    super(Lesson);
  }
}
