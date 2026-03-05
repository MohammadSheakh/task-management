//@ts-ignore
import { model, Schema } from 'mongoose';
import { IWallet, IWalletModel } from './wallet.interface';
import paginate from '../../../common/plugins/paginate';
import { TCurrency } from '../../../enums/payment';
import { TWalletStatus } from './wallet.constant';
import { Roles } from '../../../middlewares/roles';


const WalletSchema = new Schema<IWallet>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: { // this is withdrawal balance
      type: Number,
      default: 0,
      required: [false, 'amount is not required'],
    },
    totalBalance: { // it includes admin part also
      type: Number,
      default: 0,
      required: [false, 'totalBalance is not required'],
    },
    currency:{
      type: String,
      enum:[
        TCurrency.bdt,
      ],
      default: TCurrency.bdt,
      required: [false, 'currency is not required'],
    },
    status:{
      type: String,
      enum:[
        TWalletStatus.active,
        TWalletStatus.frozen,
        TWalletStatus.suspended,
      ],
      default: TWalletStatus.active,
      required: [false, 'status is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

WalletSchema.plugin(paginate);

// Use transform to rename _id to _projectId
WalletSchema.set('toJSON', {
  transform: function (doc: any, ret: any, options: any) {
    ret._walletId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Wallet = model<
  IWallet,
  IWalletModel
>('Wallet', WalletSchema);
