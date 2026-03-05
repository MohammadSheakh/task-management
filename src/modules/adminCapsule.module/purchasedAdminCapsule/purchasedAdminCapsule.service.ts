import { StatusCodes } from 'http-status-codes';
import { PurchasedAdminCapsule } from './purchasedAdminCapsule.model';
import { IPurchasedAdminCapsule } from './purchasedAdminCapsule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IUser } from '../../token/token.interface';
import { IUser as IMainUser } from '../../user.module/user/user.interface';
import { User } from '../../user.module/user/user.model';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import ApiError from '../../../errors/ApiError';
//@ts-ignore
import Stripe from "stripe";
import stripe from '../../../config/paymentGateways/stripe.config';
//@ts-ignore
import mongoose from 'mongoose';
import { TCurrency } from '../../../enums/payment';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import { IAdminCapsule } from '../adminCapsule/adminCapsule.interface';
import { AdminCapsule } from '../adminCapsule/adminCapsule.model';
import { config } from '../../../config';
import { TPurchasedAdminCapsuleStatus } from './purchasedAdminCapsule.constant';
import { IAdminCapsuleCategory } from '../adminCapsuleCategory/adminCapsuleCategory.interface';
import { AdminCapsuleCategory } from '../adminCapsuleCategory/adminCapsuleCategory.model';


export class PurchasedAdminCapsuleService extends GenericService<
  typeof PurchasedAdminCapsule,
  IPurchasedAdminCapsule
> {

  private stripe: Stripe;
  constructor() {
    super(PurchasedAdminCapsule);
    this.stripe = stripe;
  }


  /*-─────────────────────────────────
  |  We move this purchase logic .. to payment.module folder 
  └──────────────────────────────────*/
  async createV2(capsuleId:string, user: IUser) : Promise<IPurchasedAdminCapsule | { url: any}> {

  
    const existingUser:IMainUser = await User.findById(user.userId).select('subscriptionType name');

    const checkAlreadyPurchased = await PurchasedAdminCapsule.findOne({
      capsuleId,
      studentId: user.userId,
      paymentStatus : TPaymentStatus.completed,
    });

    if(checkAlreadyPurchased){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already purchased this admin capsule');
    }

    const existingAdminCapsule :IAdminCapsule = await AdminCapsule.findOne({
      _id: capsuleId,
    })

    if (!existingAdminCapsule) {
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
    let purchasedAdminCapsule : IPurchasedAdminCapsule | any;
    
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
  
      purchasedAdminCapsule = await PurchasedAdminCapsule.create(
        [{
          studentId: user?.userId,
          capsuleId : capsuleId,
          
          paymentMethod : null, // in webhook we will update this
          paymentTransactionId : null,  // in webhook we will update this
          paymentStatus : TPaymentStatus.pending, // may be unpaid hoile valo hobe 
          //@ts-ignore
          price: parseInt(existingAdminCapsule.price),
          status : TPurchasedAdminCapsuleStatus.start,
          isGifted : false,
          isCertificateUploaded : false,
          totalModules : existingAdminCapsule.totalModule,
        }], { session }
      );

    });
    session.endSession();

    
    if(!purchasedAdminCapsule){
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
              unit_amount : purchasedAdminCapsule[0].price! * 100, // Convert to cents
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
            referenceId: purchasedAdminCapsule[0]._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
            referenceFor: TTransactionFor.PurchasedAdminCapsule, // in webhook .. this should be the referenceFor
            currency: TCurrency.usd,
            amount: purchasedAdminCapsule[0].price!.toString(), // TODO : FIX :  Must Check
            user: JSON.stringify(user), // who created this order  // as we have to send notification also may be need to send email
            referenceId2: existingAdminCapsule._id.toString(), // we need adminCapsuleId .. because based on this AdminCapsule we need to find out all the modules .. and create "moduleProgress" which is basically to track students module progress
            referenceFor2 : 'AdminCapsule',
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

  async getAllWithGiftedAndCategories(user : IUser) {
    
    // PERF:
    const pipeline = [
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(user.userId),
          isDeleted: false,
          $or: [
            { isGifted: false, paymentTransactionId: { $ne: null } },
            { isGifted: true, paymentTransactionId: null },
          ],
        },
      },

      // Join AdminCapsule
      {
        $lookup: {
          from: 'admincapsules',
          localField: 'capsuleId',
          foreignField: '_id',
          as: 'capsule',
        },
      },
      { $unwind: '$capsule' },

      // Attachments lookup
      {
        $lookup: {
          from: 'attachments',
          localField: 'capsule.attachments',
          foreignField: '_id',
          as: 'attachments',
        },
      },

      
      // Review stats lookup
      {
        $lookup: {
          from: 'admincapsulereviews',
          let: { capsuleId: '$capsule._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$adminCapsuleId', '$$capsuleId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: 'reviewStats',
        },
      },

      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.avgRating', 0] }, 0],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.totalReviews', 0] }, 0],
          },
        },
      },

      {
        $project: {
          _id: 0,
          purchasedId: '$_id',
          isGifted: 1,

          capsuleId: '$capsule._id',
          title: '$capsule.title',
          description: '$capsule.description',
          estimatedTime: '$capsule.estimatedTime',

          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: '$$att.attachment',
            },
          },

          avgRating: { $round: ['$avgRating', 1] },
          totalReviews: 1,
        },
      },

      // 🔥 Split into two arrays
      {
        $facet: {
          giftedCapsules: [
            { $match: { isGifted: true } }
          ],
          purchasedCapsules: [
            { $match: { isGifted: false } }
          ],
        },
      },
    ];


    const [capsules, categories] = await Promise.all([
      PurchasedAdminCapsule.aggregate(pipeline),
      
      //---------------

      AdminCapsuleCategory.find({
        isDeleted: false,
      }).select('-description -__v -updatedAt -createdAt -isDeleted')
      .populate({
        path: 'attachments',
        select: 'attachment',
      })
      .lean()

    ]);


     return {capsules, categories};
  }

  
}
