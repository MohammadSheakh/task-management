//@ts-ignore
import express from 'express';
import * as validation from './mentorReview.validation';
import { MentorReviewController} from './mentorReview.controller';
import { IMentorReview } from './mentorReview.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { injectUserReference } from '../../../middlewares/injectUserReference';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IMentorReview | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new MentorReviewController();


// router.route('/paginate').get(
//   auth(TRole.common),
//   validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
//   controller.getAllWithPagination
// );


// router.route('/:id').get(
//   auth(TRole.common),
//   controller.getById
// );


// router.route('/:id').put(
//   auth(TRole.common),
//   // validateRequest(validation.createHelpMessageValidationSchema),
//   controller.updateById
// );


// router.route('/').get(
//   auth(TRole.common),
//   controller.getAll
// );


/*-───────────────────────────────── 
|  | student can give rating for mentor 
|  @figmaIndex 00-00
|  @desc 
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.student),
  injectUserReference('userId'), // as student create this review
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.createOrUpdate
 );


// router.route('/:id/permenent').delete(
//   auth(TRole.common),
//   controller.deleteById
// );


// router.route('/:id').delete(
//   auth(TRole.common),
//   controller.softDeleteById
// );



export const MentorReviewRoute = router;
