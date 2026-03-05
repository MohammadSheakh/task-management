import { TTransactionFor } from "../../../constants/TTransactionFor";
import { TCurrency } from "../../../enums/payment";
import ApiError from "../../../errors/ApiError";
import { PurchaseStrategy } from "../../payment.module/payment/purchaseStrategy/purchaseStrategy.abstract";
import { TPaymentStatus } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { IUser } from "../../token/token.interface";
import { IAdminCapsule } from "../adminCapsule/adminCapsule.interface";
import { AdminCapsule } from "../adminCapsule/adminCapsule.model";
import { TPurchasedAdminCapsuleStatus } from "./purchasedAdminCapsule.constant";
import { PurchasedAdminCapsule } from "./purchasedAdminCapsule.model";
import { StatusCodes } from 'http-status-codes';

// AdminCapsule — only the differences
export class AdminCapsulePurchaseStrategy extends PurchaseStrategy<IAdminCapsule> {

    async checkAlreadyPurchased(capsuleId: string, userId: string) {
        return !!await PurchasedAdminCapsule.findOne({ 
        capsuleId, studentId: userId,
        paymentStatus: TPaymentStatus.completed 
        });
    }

    async findExisting(capsuleId: string) {
        return AdminCapsule.findById(capsuleId);
    }

    async createPendingPurchase(capsule: IAdminCapsule, user: IUser, session: any) {
        const result = await PurchasedAdminCapsule.create([{
            studentId: user.userId,
            capsuleId: capsule._id,

            paymentMethod : null, // in webhook we will update this
            paymentTransactionId : null,  // in webhook we will update this
            paymentStatus : TPaymentStatus.pending, // may be unpaid hoile valo hobe 
          

            price: parseInt(capsule.price),
            status : TPurchasedAdminCapsuleStatus.start,

            isGifted: false,
            isCertificateUploaded : false,
            totalModules: capsule.totalModule,
            
        }], { session });

        if(!result[0]){
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Expedition Journey Purchasing Failed !");
        }

        return result[0];
    }

    getMetadata(purchase: any, capsule: IAdminCapsule, user: IUser) {
        return {
        referenceId: purchase._id.toString(),
        referenceFor: TTransactionFor.PurchasedAdminCapsule,
        referenceId2: capsule._id.toString(),
        referenceFor2: 'AdminCapsule',
        amount: purchase.price.toString(),
        currency: TCurrency.usd,
        user: JSON.stringify(user),
        };
    }
}