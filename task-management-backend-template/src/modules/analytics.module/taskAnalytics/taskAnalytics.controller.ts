//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TaskAnalyticsService } from './taskAnalytics.service';
//@ts-ignore
import { Request, Response } from 'express';
import { IUser } from '../../token/token.interface';
import { Types } from 'mongoose';

const taskAnalyticsService = new TaskAnalyticsService();

export class TaskAnalyticsController {
  /** ----------------------------------------------
   * @role Admin | User
   * @Section Analytics
   * @module TaskAnalytics
   * @figmaIndex 03-01
   * @desc Get platform-wide task overview
   *----------------------------------------------*/
  getOverview = catchAsync(async (req: Request, res: Response) => {
    const result = await taskAnalyticsService.getOverview();

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Task overview retrieved successfully',
      success: true,
    });
  });

  /** ----------------------------------------------
   * @role Admin | User | Group Member
   * @Section Analytics
   * @module TaskAnalytics
   * @figmaIndex 03-01
   * @desc Get task status distribution
   *----------------------------------------------*/
  getStatusDistribution = catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.query;
    const userId = (req.user as IUser).userId;

    const result = await taskAnalyticsService.getStatusDistribution({
      groupId: groupId as string,
      userId: userId.toString(),
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Status distribution retrieved successfully',
      success: true,
    });
  });

  /** ----------------------------------------------
   * @role Group Owner | Group Admin
   * @Section Analytics
   * @module TaskAnalytics
   * @figmaIndex dashboard-flow-01.png
   * @desc Get group task analytics
   *----------------------------------------------*/
  getGroupTaskAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.params;

    const result = await taskAnalyticsService.getGroupTaskAnalytics(
      new Types.ObjectId(groupId)
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Group task analytics retrieved successfully',
      success: true,
    });
  });

  /** ----------------------------------------------
   * @role Admin | User
   * @Section Analytics
   * @module TaskAnalytics
   * @figmaIndex 03-01
   * @desc Get daily task summary
   *----------------------------------------------*/
  getDailySummary = catchAsync(async (req: Request, res: Response) => {
    const { date } = req.query;

    const result = await taskAnalyticsService.getDailySummary(
      date ? new Date(date as string) : undefined
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Daily summary retrieved successfully',
      success: true,
    });
  });
}

export const taskAnalyticsController = new TaskAnalyticsController();
