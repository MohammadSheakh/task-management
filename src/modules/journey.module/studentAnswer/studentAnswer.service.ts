import { StatusCodes } from 'http-status-codes';
import { StudentAnswer } from './studentAnswer.model';
import { IStudentAnswer } from './studentAnswer.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class StudentAnswerService extends GenericService<
  typeof StudentAnswer,
  IStudentAnswer
> {
  constructor() {
    super(StudentAnswer);
  }
}
