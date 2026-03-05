//@ts-ignore
import express from 'express';
import * as validation from './walletTransactionHistory.validation';
import { WalletTransactionHistoryController} from './walletTransactionHistory.controller';
import { IWalletTransactionHistory } from './walletTransactionHistory.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import { IsProviderRejected } from '../../../middlewares/provider/IsProviderRejected';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IWalletTransactionHistory | 'sortBy' | 'page' | 'limit' | 'populate'>(
  filters: T[]
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

// const taskService = new TaskService();
const controller = new WalletTransactionHistoryController();

router.route('/paginate').get(
  auth(TRole.common),
  IsProviderRejected(),
  validateFiltersForQuery(optionValidationChecking(['_id', 'walletId', ...paginationOptions])),
  controller.getAllWithPagination
);


/** ---------------------------------------------- Suplify , Kaj Bd
 * @role Service Provider
 * @Section Profile -> Wallet
 * @module Wallet | Wallet Transaction History
 * @figmaIndex 06-05
 * @desc 
 * 
 *----------------------------------------------*/
router.route('/paginate-with-wallet').get(
  auth(TRole.common),
  IsProviderRejected(),
  validateFiltersForQuery(optionValidationChecking(['_id', 'walletId', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('userId'),
  setQueryOptions({ // this will work on transaction history
    populate: [],
    select: '-isDeleted -updatedAt'
  }),
  controller.getAllWithWallet
);


//-------------------------------- Suplify
// Specialist | Get Overview of Earnings
//---------------------------------
// router.route('/overview').get(
//   auth(TRole.admin),
//   controller.getMyEarningsOverview
// );

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/update/:id').put(
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth(TRole.common),
  controller.getAll
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').post(
  auth(TRole.common),
  validateRequest(validation.createHelpMessageValidationSchema),
  controller.create
);

router.route('/:id/permenent').delete(
  auth(TRole.common),
  controller.deleteById
);

router.route('/:id').delete(
  auth(TRole.common),
  controller.softDeleteById
);


export const WalletTransactionHistoryRoute = router;
