import { StatusCodes } from 'http-status-codes';
import { Question } from './question.model';
import { IQuestion } from './question.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class QuestionService extends GenericService<
  typeof Question,
  IQuestion
> {
  constructor() {
    super(Question);
  }
}
