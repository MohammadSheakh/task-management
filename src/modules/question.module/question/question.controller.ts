import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Question } from './question.model';
import { ICreateQuestionAndAnswer, IQuestion } from './question.interface';
import { QuestionService } from './question.service';
import catchAsync from '../../../shared/catchAsync';
import { TQuestionAnswer } from './question.constant';
import sendResponse from '../../../shared/sendResponse';
import { errorLogger, logger } from '../../../shared/logger';
import ApiError from '../../../errors/ApiError';
import { QuestionAnswer } from '../questionAnswer/questionAnswer.model';
import mongoose from 'mongoose';

export class QuestionController extends GenericController<
  typeof Question,
  IQuestion
> {
  // QuestionService = new QuestionService();

  constructor() {
    super(new QuestionService(), 'Question');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data:ICreateQuestionAndAnswer = req.body;

    // Use transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const questionCount = await Question.countDocuments({
        isDeleted: false,
        // phaseId: data.phaseId  // we cant find question count by phaseId
      }).session(session);;

      console.log("questionCount", questionCount);

      const questionDTO: IQuestion = {
        phaseNumber: data.phaseNumber,
        phaseId: data.phaseId,
        questionNumber:  questionCount + 1, 
        questionText : data.questionText ,
        answerType : data.answerType,
      }

      logger.error('-----------');
      errorLogger.error('-----');

      // Validate answers for multi/single choice
      if ([TQuestionAnswer.multi, TQuestionAnswer.single].includes(data.answerType)) {
        if (!data.answers?.length) {

          logger.error('Answers array is not provided');
          errorLogger.error('Answers array is not provided');

          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Answers are required for multiple/single choice questions'
          );
        }
      }

      const createdQuestion = await this.service.createWithSession(questionDTO, session);


      console.log("createdQuestion =>>>", createdQuestion);

      if(data.answerType == TQuestionAnswer.multi || data.answerType == TQuestionAnswer.single){
        // look up into answer array .. and create answer for this question .. 
        // before that we need to create the question

        /*--------------------------------------
        for(const answer of data.answers){

          const questionAnswerCount = await QuestionAnswer.countDocuments({ 
            isDeleted: false,
            questionId : createdQuestion._id,
          });

          await QuestionAnswer.create({
            questionId : createdQuestion._id,
            answerTitle : answer.answerTitle,
            answerSubTitle : answer.answerSubTitle,
            displayOrder : questionAnswerCount + 1,
          })
        }
        -------------------------------------*/

        const answerDocs = data.answers.map((ans, idx) => ({
          questionId: createdQuestion._id,
          answerTitle: ans.answerTitle,
          answerSubTitle: ans.answerSubTitle,
          displayOrder: idx + 1,
          isDeleted: false
        }));

        console.log("answerDocs -> ", answerDocs);

        const res = await QuestionAnswer.insertMany(answerDocs, { session });

      }

      // 🎯
      await session.commitTransaction();

      sendResponse(res, {
        code: StatusCodes.OK,
        data: createdQuestion,
        message: `${this.modelName} created successfully`,
        success: true,
      });

    } catch (error) {
      await session.abortTransaction();
      logger.error('Failed to create question:', error);
      throw error;
    } finally {
      session.endSession();
    }
  });

    

  // add more methods here if needed or override the existing ones 
}
