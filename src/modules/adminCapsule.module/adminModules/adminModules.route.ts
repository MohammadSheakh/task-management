//@ts-ignore
import express from 'express';
import * as validation from './adminModules.validation';
import { AdminModulesController} from './adminModules.controller';
import { IAdminModules } from './adminModules.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { imageUploadPipelineForCreateAdminModules } from './adminModules.middleware';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IAdminModules | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new AdminModulesController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
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
  auth(TRole.common),
  controller.getAll
);

/*-───────────────────────────────── 
| Admin | create admin module for a admin  
|  @figmaIndex 0-0
|  @desc  
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.common),
  ...imageUploadPipelineForCreateAdminModules, // TODO : MUST :  uncomment this line 
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

export const AdminModulesRoute = router;
