import { TTransactionFor } from "../../../constants/TTransactionFor";
import { TCurrency } from "../../../enums/payment";
import { PurchaseStrategy } from "../../payment.module/payment/purchaseStrategy/purchaseStrategy.abstract";
import { TPaymentStatus } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { IUser } from "../../token/token.interface";
import { IJourney } from "../journey/journey.interface";
import { Journey } from "../journey/journey.model";
import { PurchasedJourney } from "./purchasedJourney.model";

export class JourneyPurchaseStrategy extends PurchaseStrategy<IJourney>{
    
    async checkAlreadyPurchased(journeyId: string, userId: string) {
        return !!await PurchasedJourney.findOne({ 
            journeyId, studentId: userId, 
            paymentStatus: TPaymentStatus.completed 
            });
    }

    async findExisting(journeyId: string) {
        return Journey.findById(journeyId);
    }

    async createPendingPurchase(journey: IJourney, user: IUser, session: any) {
        const result = await PurchasedJourney.create([{
            studentId: user.userId,
            journeyId: journey._id,
            paymentStatus: TPaymentStatus.pending,
            price: parseInt(journey.price),
            paymentTransactionId: null,
        }], { session });
        return result[0];
    }

    getMetadata(purchase: any, journey: IJourney, user: IUser) {
        return {
            referenceId: purchase._id.toString(),
            referenceFor: TTransactionFor.PurchasedJourney,
            referenceId2: journey._id.toString(),
            referenceFor2: 'Journey',
            amount: purchase.price.toString(),
            currency: TCurrency.usd,
            user: JSON.stringify(user),
        };
    }
}