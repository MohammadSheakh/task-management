import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { PurchasedAdminCapsule } from './purchasedAdminCapsule.model';
import { IPurchasedAdminCapsule } from './purchasedAdminCapsule.interface';
import { PurchasedAdminCapsuleService } from './purchasedAdminCapsule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { PaymentService } from '../../payment.module/payment/payment.service';
import { AdminCapsulePurchaseStrategy } from './adminCapsulePurchaseStrategy';
import { StripeGateway } from '../../payment.module/payment/gateways/stripe/stripe.gateway';

export class PurchasedAdminCapsuleController extends GenericController<
  typeof PurchasedAdminCapsule,
  IPurchasedAdminCapsule
> {
    purchasedAdminCapsuleService = new PurchasedAdminCapsuleService();
    paymentService = new PaymentService();

    constructor() {
      super(new PurchasedAdminCapsuleService(), 'PurchasedAdminCapsule');

      this.paymentService.registerStrategy('Capsule', new AdminCapsulePurchaseStrategy());

      // Register gateways
      this.paymentService.registerGateway('stripe', new StripeGateway());
    }

    create = catchAsync(async (req: Request, res: Response) => {
      
      //const result = await this.purchasedAdminCapsuleService.createV2(req.params.adminCapsuleId, req.user as IUser);
      
      const strategy = 
        await this.paymentService.processPayment(
          'Capsule', // purchaseType
          'stripe', // gatewayType  //---- so, user can later choose payment gateway 
          req.params.adminCapsuleId,
          req.user as IUser
        );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: strategy,
        message: `${this.modelName} created successfully`,
        success: true,
      });
    });

    
    getAllWithGiftedAndCategories = catchAsync(async (req: Request, res: Response) => {
      
      const result = await this.purchasedAdminCapsuleService.getAllWithGiftedAndCategories(req.user as IUser);

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: `${this.modelName} created successfully`,
        success: true,
      });
    });

  // add more methods here if needed or override the existing ones 
}
