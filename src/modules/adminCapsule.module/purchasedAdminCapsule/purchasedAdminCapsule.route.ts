//@ts-ignore
import express from 'express';
import * as validation from './purchasedAdminCapsule.validation';
import { PurchasedAdminCapsuleController} from './purchasedAdminCapsule.controller';
import { IPurchasedAdminCapsule } from './purchasedAdminCapsule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IPurchasedAdminCapsule | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new PurchasedAdminCapsuleController();


// router.route('/paginate').get(
//   //auth('common'),
//   validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
//   controller.getAllWithPagination
// );

/*-─────────────────────────────────
|  Student | My Capsules | get all purchased capsule and gifted capsule and capsule categories
└──────────────────────────────────*/
router.route('/with-gifted-capsule-nd-categories').get(
  auth(TRole.student),
  controller.getAllWithGiftedAndCategories
);

// router.route('/:id').get(
//   // auth('common'),
//   controller.getById
// );

// router.route('/:id').put(
//   //auth('common'),
//   // validateRequest(validation.createHelpMessageValidationSchema),
//   controller.updateById
// );


// router.route('/').get(
//   auth(TRole.common),
//   controller.getAll
// );

/*-─────────────────────────────────
|  Student | Purchase Admin Capsule
└──────────────────────────────────*/
router.route('/:adminCapsuleId').post(
  auth(TRole.student),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.create
);

// router.route('/:id/permenent').delete(
//   auth(TRole.common),
//   controller.deleteById
// );

// router.route('/:id').delete(
//   auth(TRole.common),
//   controller.softDeleteById
// );


export const PurchasedAdminCapsuleRoute = router;
