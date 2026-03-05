import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { StudentAnswer } from './studentAnswer.model';
import { IStudentAnswer } from './studentAnswer.interface';
import { StudentAnswerService } from './studentAnswer.service';

export class StudentAnswerController extends GenericController<
  typeof StudentAnswer,
  IStudentAnswer
> {
  StudentAnswerService = new StudentAnswerService();

  constructor() {
    super(new StudentAnswerService(), 'StudentAnswer');
  }

  // add more methods here if needed or override the existing ones 
}
