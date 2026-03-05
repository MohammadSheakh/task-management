//@ts-ignore
import express from 'express';
import * as validation from './faq.validation';
import { FaqController} from './faq.controller';
import { IFaq } from './faq.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IFaq | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new FaqController();

//
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', 'faqCategoryId', ...paginationOptions])),
  controller.getAllWithPagination
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
|  create faq  
|  @figmaIndex 00-00
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



export const FaqRoute = router;
