//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { BankInfo } from './bankInfo.model';
import { IBankInfo } from './bankInfo.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class BankInfoService extends GenericService<
  typeof BankInfo,
  IBankInfo
> {
  constructor() {
    super(BankInfo);
  }

  //---------------------------------
  // Specialist / Doctor | create or update bank info
  //---------------------------------
  async createOrUpdateBankInfo(userId: string , data: IBankInfo) {
    const bankInfo:IBankInfo = await BankInfo.findOne({
      userId: userId
    });


    let bank;
    if (!bankInfo) {

      bank = await BankInfo.create(data);
    
    }else{

      bankInfo.bankAccountHolderName = data.bankAccountHolderName;
      bankInfo.bankAccountNumber = data.bankAccountNumber;
      bankInfo.bankAccountType = data.bankAccountType;
      bankInfo.bankBranch = data.bankBranch;
      bankInfo.bankName = data.bankName;
      bankInfo.bankRoutingNumber = data.bankRoutingNumber;
      bankInfo.userId = userId;

      bank = await BankInfo.findByIdAndUpdate(bankInfo._id,
         bankInfo
         ,{ new: true });

    }

    return bank;
  }
}
