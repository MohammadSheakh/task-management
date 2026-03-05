import { StatusCodes } from 'http-status-codes';
import { QuestionAnswer } from './questionAnswer.model';
import { IQuestionAnswer } from './questionAnswer.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class QuestionAnswerService extends GenericService<
  typeof QuestionAnswer,
  IQuestionAnswer
> {
  constructor() {
    super(QuestionAnswer);
  }
}
