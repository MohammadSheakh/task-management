import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { PurchasedJourney } from './purchasedJourney.model';
import { IPurchasedJourney } from './purchasedJourney.interface';
import { PurchasedJourneyService } from './purchasedJourney.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { PaymentService } from '../../payment.module/payment/payment.service';

export class PurchasedJourneyController extends GenericController<
  typeof PurchasedJourney,
  IPurchasedJourney
> {
  purchasedJourneyService = new PurchasedJourneyService();
  paymentService = new PaymentService();

  constructor() {
    super(new PurchasedJourneyService(), 'PurchasedJourney');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    
    // const result = await this.purchasedJourneyService.createV2(req.params.journeyId, req.user as IUser);

    const strategy = 
        await this.paymentService.processPayment(
          'Journey', // purchaseType
          'stripe', // gatewayType  //---- so, user can later choose payment gateway 
          req.params.journeyId,
          req.user as IUser
        );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: strategy,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
