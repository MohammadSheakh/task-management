//@ts-ignore
import express from 'express';
import * as validation from './adminCapsule.validation';
import { AdminCapsuleController} from './adminCapsule.controller';
import { IAdminCapsule } from './adminCapsule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { imageUploadPipelineForCreateAdminCapsule } from './adminCapsule.middleware';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IAdminCapsule | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new AdminCapsuleController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-───────────────────────────────── 
| Admin | get all modules by capsuleId
|  @figmaIndex 00-00
|  @desc 
└──────────────────────────────────*/
router.route('/:capsuleId/modules').get(
  auth(TRole.common),
  controller.getAllModulesByCapsuleId 
);

/*-───────────────────────────────── 
| Student | First Time Starting Capsule | 06 | get all modules with lessons and reviews by capsuleId
|  @figmaIndex 00-00 
|  @desc 
└──────────────────────────────────*/
router.route('/with-modules-nd-lessons-nd-reviews/:adminCapsuleId').get(
  auth(TRole.student),
  controller.getWithModulesAndReviews
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
| Admin | create admin capsule with multiple topics .. 
|  @figmaIndex 0-0
|  @desc  
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.admin),
  // ...imageUploadPipelineForCreateAdminCapsule,  // TODO : MUST : comment this line to upload photo
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



export const AdminCapsuleRoute = router;
