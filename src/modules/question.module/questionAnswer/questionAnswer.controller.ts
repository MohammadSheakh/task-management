import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { QuestionAnswer } from './questionAnswer.model';
import { IQuestionAnswer } from './QuestionAnswer.interface';
import { QuestionAnswerService } from './questionAnswer.service';

export class QuestionAnswerController extends GenericController<
  typeof QuestionAnswer,
  IQuestionAnswer
> {
  QuestionAnswerService = new QuestionAnswerService();

  constructor() {
    super(new QuestionAnswerService(), 'QuestionAnswer');
  }

  // add more methods here if needed or override the existing ones 
}
