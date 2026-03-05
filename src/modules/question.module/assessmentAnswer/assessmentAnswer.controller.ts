import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AssessmentAnswer } from './assessmentAnswer.model';
import { IAssessmentAnswer } from './assessmentAnswer.interface';
import { AssessmentAnswerService } from './assessmentAnswer.service';

export class AssessmentAnswerController extends GenericController<
  typeof AssessmentAnswer,
  IAssessmentAnswer
> {
  AssessmentAnswerService = new AssessmentAnswerService();

  constructor() {
    super(new AssessmentAnswerService(), 'AssessmentAnswer');
  }

  // add more methods here if needed or override the existing ones 
}
