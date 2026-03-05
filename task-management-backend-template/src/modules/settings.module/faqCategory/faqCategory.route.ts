//@ts-ignore
import express from 'express';
import * as validation from './faqCategory.validation';
import { FaqCategoryController} from './faqCategory.controller';
import { IFaqCategory } from './faqCategory.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IFaqCategory | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new FaqCategoryController();

//
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-───────────────────────────────── 
|  Admin | get all Faq category and its faq's
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/

router.route('/with-faqs').get(
  auth(TRole.common),
  controller.getAllCategoriesWithItsFaqs
);

router.route('/:id').get(
  auth(TRole.common),
  controller.getById
);

router.route('/:id').put(
  auth(TRole.common),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth(TRole.common),
  controller.getAll
);

/*-───────────────────────────────── 
|  create faq category
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.admin),
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



export const FaqCategoryRoute = router;
