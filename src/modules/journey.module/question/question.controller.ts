import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Question } from './question.model';
import { IQuestion } from './question.interface';
import { QuestionService } from './question.service';

export class QuestionController extends GenericController<
  typeof Question,
  IQuestion
> {
  QuestionService = new QuestionService();

  constructor() {
    super(new QuestionService(), 'Question');
  }

  // add more methods here if needed or override the existing ones 
}
