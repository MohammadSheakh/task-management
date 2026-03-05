
import express from 'express';
import * as validation from './adminModuleProgress.validation';
import { AdminModuleProgressController} from './adminModuleProgress.controller';
import { IAdminModuleProgress } from './adminModuleProgress.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IAdminModuleProgress | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new AdminModuleProgressController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-─────────────────────────────────
| ( Landing Page ) |
|  Student | My Capsules | get all modules and lessons by capsuleId with module and lesson's progress information
└──────────────────────────────────*/
router.route('/purchased-module-nd-lessons/:capsuleId').get(
  auth(TRole.student),
  controller.getModuleProgressByCapsule
);

/*-─────────────────────────────────
| ( My Capsules ) | ( First Time Starting Capsule )  | 03
|  Student |  update a lessons status .. if next lesson exist .. then unlock that lesson 
|  if no lesson exist .. then make next module unlock and first lesson is also unlock
└──────────────────────────────────*/
router.route('/update-lesson-status/:lessonProgressId/:lessonId/:capsuleId').put(
  auth(TRole.student),
  controller.updateLessonStatus
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

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').post(
  // [
  //   upload.fields([
  //     { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
  //   ]),
  // ],
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
export const AdminModuleProgressRoute = router;
