import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Phase } from './phase.model';
import { ICreatePhase, IPhase } from './phase.interface';
import { PhaseService } from './phase.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { logger } from '../../../shared/logger';
import colors from 'colors';

export class PhaseController extends GenericController<
  typeof Phase,
  IPhase
> {
  phaseService = new PhaseService();

  constructor() {
    super(new PhaseService(), 'Phase');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data:IPhase = req.body;

    const phaseCount = await Phase.countDocuments({ isDeleted: false });

    console.log("phaseCount", phaseCount);

    const phaseDTO: ICreatePhase = {
      // attachment will be given by admin later
      title: data.title,
      subTitle:  data.subTitle, /// as provider create this .. 
      phaseNumber : phaseCount + 1,
    }

    const result = await this.service.create(phaseDTO);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getAllPhaseWithQuestionCount = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    
    const result = await this.phaseService.getAllPhaseWithQuestionCount(filters, options);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });


  getQuestionsWithAnswersByPhase = catchAsync(
    async (req: Request, res: Response) => {

      console.log("phaseId -> ", req.params);
      logger.info(colors.green(" info -> phaseId -> ", req.params))
      logger.warn("--warn-")
      logger.error("--error--")
      
      const { phaseId } = req.params;

      
      const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
      const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

      const result = await this.phaseService.getQuestionsWithAnswersByPhaseId(
        phaseId,
        options
      );

      // PERF: Send response
      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: `Questions with answers for phase retrieved successfully`,
        success: true,
      });
    }
  );

  submitAnswerAutoSaveFeature = catchAsync(async (req: Request, res: Response) => {
  
    const updatedObject = await this.phaseService.autoSaveAnswer(
      req.body.assessmentId, 
      req.body.phase_number,
      req.body.questionId,
      req.body.answer_value,
      req.body.answer_type
    ); // here we pass studentId
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `Answer submitted successfully.`,
    });
  });

  getPhaseQuestionsWithOptionsAndAnswers = catchAsync(async (req: Request, res: Response) => {
  
    const object = await this.phaseService.getPhaseQuestionsWithOptionsAndAnswers(
      req.query.assessmentId,
      req.query.phaseId
    ); // here we pass studentId
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: object,
      message: `questions with options and student answer fetched successfully.`,
    });
  });

  /*-─────────────────────────────────
  |  It will return all questions with students actual answer .. not possible answers 
  |  by phaseNumber and assessmentId 
  └──────────────────────────────────*/
  getPhaseQuestionsWithOnlyStudentAnswers = catchAsync(async (req: Request, res: Response) => {
  
    const object = await this.phaseService.getPhaseQuestionsWithOnlyStudentAnswers(
      req.query.assessmentId,
    ); // here we pass studentId
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: object,
      message: `questions with options and student answer fetched successfully.`,
    });
  });


  generateAiSummary = catchAsync(async (req: Request, res: Response) => {
  
    const object = await this.phaseService.generateAiSummaryV2(
      req.query.assessmentId,
      req.user.userId
    );

    console.log("object :: ", object);
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: object,
      message: `AI summary generated successfully.`,
    });
  });

  // add more methods here if needed or override the existing ones 
}
