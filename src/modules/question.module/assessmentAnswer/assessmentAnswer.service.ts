import { StatusCodes } from 'http-status-codes';
import { AssessmentAnswer } from './assessmentAnswer.model';
import { IAssessmentAnswer } from './assessmentAnswer.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class AssessmentAnswerService extends GenericService<
  typeof AssessmentAnswer,
  IAssessmentAnswer
> {
  constructor() {
    super(AssessmentAnswer);
  }
}
