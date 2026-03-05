//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { PurchasedJourney } from './purchasedJourney.model';
import { IPurchasedJourney } from './purchasedJourney.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { User } from '../../user.module/user/user.model';
import { IUser } from '../../token/token.interface';
import { IUser as IMainUser } from '../../user.module/user/user.interface';
import ApiError from '../../../errors/ApiError';
import { IJourney } from '../journey/journey.interface';
import { Journey } from '../journey/journey.model';
//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import Stripe from "stripe";
import stripe from '../../../config/paymentGateways/stripe.config';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { TCurrency } from '../../../enums/payment';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import { config } from '../../../config';

export class PurchasedJourneyService extends GenericService<
  typeof PurchasedJourney,
  IPurchasedJourney
> {

  private stripe: Stripe;
  constructor() {
    super(PurchasedJourney);
    this.stripe = stripe;
  }

  /*-─────────────────────────────────
  |  We move this purchase logic .. to payment.module folder 
  └──────────────────────────────────*/
  async createV2(journeyId:string, user: IUser) : Promise<IPurchasedJourney | { url: any}> {

  
    const existingUser:IMainUser = await User.findById(user.userId).select('subscriptionType name');

    const checkAlreadyPurchased = await PurchasedJourney.findOne({
      journeyId,
      studentId: user.userId,
      paymentStatus : TPaymentStatus.completed,
    });

    if(checkAlreadyPurchased){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already purchased this journey');
    }

    const existingJourney :IJourney = await Journey.findOne({
      _id: journeyId,
    })

    if (!existingJourney) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Journey not found');
    }

    /*********
     * 📝
     * 4. ++++++ For purchase ..we create purchasedJourney 
     *                          [PaymentStatus.unpaid] [PaymentTransactionId = null]
     * 
     * 5. ++ we Provide Stripe URL to payment .. 
     * -----------------------------------------------------------
     * 6. If Payment Successful .. its going to WEBHOOK 
     * 7. ++++ We create Payment Transaction .. 
     * 7. ++++ We update TrainingProgramPurchase [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
     * 
     * ******* */

    let stripeResult ;
    let purchasedJourney : IPurchasedJourney | any;
    
    try {
    //---------------------------------
    // If stripeCustomerId found .. we dont need to create that .. 
    //---------------------------------  

    let stripeCustomer;
    if(!user.stripe_customer_id){
        let _stripeCustomer = await stripe.customers.create({
            name: user?.userName,
            email: user?.email,
        });
        
        stripeCustomer = _stripeCustomer.id;

        await User.findByIdAndUpdate(user?.userId, { $set: { stripe_customer_id: stripeCustomer } });
    }else{
        stripeCustomer = user.stripe_customer_id;
    }

    const session = await mongoose.startSession();

    // session.startTransaction();
    await session.withTransaction(async () => {
  
      purchasedJourney = await PurchasedJourney.create(
        [{
          studentId: user?.userId,
          journeyId : existingJourney._id,
          
          paymentMethod : null, // in webhook we will update this
          paymentTransactionId : null,  // in webhook we will update this
          paymentStatus : TPaymentStatus.pending, // may be unpaid hoile valo hobe 
          //@ts-ignore
          price: parseInt(existingJourney.price)
        }], { session }
      );

    });
    session.endSession();

    
    if(!purchasedJourney){
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Expedition Journey Purchasing Failed !");
    }
    
    const stripeSessionData: any = {
        payment_method_types: ['card'],
        mode: 'payment',
        customer: stripeCustomer.id,
        line_items: [
          {
            price_data: {
              currency: TCurrency.usd, // must be small letter
              product_data: {
                  name: 'Amount',
              },
              unit_amount : purchasedJourney[0].price! * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
            /*****
             * 📝
             * we receive these data in webhook ..
             * based on this data .. we have to update our database in webhook ..
             * also give user a response ..
             * 
             * now as our system has multiple feature that related to payment 
             * so we provide all related data as object and stringify that ..
             * also provide .. for which category these information we passing ..
             * 
             * like we have multiple usecase like
             * 1. Product Order,
             * 2. Lab Booking,
             * 3. Doctor Appointment 
             * 4. Specialist Workout Class Booking,
             * 5. Training Program Buying .. 
             *  
             * **** */
            referenceId: purchasedJourney[0]._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
            referenceFor: TTransactionFor.PurchasedJourney, // in webhook .. this should be the referenceFor
            currency: TCurrency.usd,
            amount: purchasedJourney[0].price!.toString(), // TODO : FIX :  Must Check
            user: JSON.stringify(user), // who created this order  // as we have to send notification also may be need to send email
            referenceId2: existingJourney._id.toString(), // we need journeyId .. because based on this journey we need to find out all the capsules .. and create studentCapsuleTracker
            referenceFor2 : 'Journey',
            /******
             * 📝
             * With this information .. first we create a 
             * PaymentTransaction ..  where paymentStatus[Complete]
             *  +++++++++++++++++++++ transactionId :: coming from Stripe
             * ++++++++++++++++++++++ paymentIntent :: coming from stripe .. or we generate this 
             * ++++++++++++++++++++++ gatewayResponse :: whatever coming from stripe .. we save those for further log
             * 
             * We also UPDATE Order Infomation .. 
             * 
             * status [ ]
             * paymentTransactionId [🆔]
             * paymentStatus [paid]
             * 
             * ******* */
        },
        success_url: config.stripe.success_url,
        cancel_url: config.stripe.cancel_url,
    };

      try {
          const session = await stripe.checkout.sessions.create(stripeSessionData);
          console.log({
                  url: session.url,
          });
          stripeResult = { url: session.url };
      } catch (error) {
          console.log({ error });
      }

    } catch (err) {
        console.error("🛑 Error While creating Order", err);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Order creation failed');
    }
    //@ts-ignore
    return  stripeResult; // result ;//session.url;
  }

}
