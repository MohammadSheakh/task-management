//@ts-ignore
import express from 'express';
import * as validation from './adminCapsuleCategory.validation';
import { AdminCapsuleCategoryController} from './adminCapsuleCategory.controller';
import { IAdminCapsuleCategory } from './adminCapsuleCategory.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { imageUploadPipelineForCreateAdminCapsuleCategory } from './adminCapsuleCategory.middleware';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IAdminCapsuleCategory | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new AdminCapsuleCategoryController();

/*-───────────────────────────────── 
| Admin | create capsule category
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-───────────────────────────────── 
| Landing Page | get all capsule category and top 3 mentor review 
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/
router.route('/landing').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllCapsuleCategoryAndTopThreeMentorReview
);


/*-───────────────────────────────── 
| Admin | get a category details with all capsules
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/
router.route('/:capsuleCategoryId/capsules').get(
  // auth('common'),
  controller.getAllCapsulesByCategoryId 
);

/*-───────────────────────────────── 
| Landing | get all capsule with rating info by category
|  @figmaIndex 
|  @desc with category information
└──────────────────────────────────*/
router.route('/:capsuleCategoryId/capsules-with-rating').get(
  // auth('common'),
  controller.getAllCapsulesWithRatingInfoByCategoryId 
);

/*-───────────────────────────────── 
| Landing | get all capsule with rating info by category
|  @figmaIndex 
|  @desc  without category information
└──────────────────────────────────*/
router.route('/:capsuleCategoryId/capsules-with-rating/student').get(
  auth(TRole.student),
  controller.getAllCapsulesWithRatingInfoByCategoryIdForStudent 
);


router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/:id').put(
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

/*-───────────────────────────────── 
| Admin | create capsule category
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.admin),
  ...imageUploadPipelineForCreateAdminCapsuleCategory,
  // validateRequest(validation.createHelpMessageValidationSchema),
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

export const AdminCapsuleCategoryRoute = router;
