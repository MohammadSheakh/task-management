//@ts-ignore
import express from 'express';
import * as validation from './meeting.validation';
import { MeetingController} from './meeting.controller';
import { IMeeting } from './meeting.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IMeeting | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new MeetingController();


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
|  | create  
|  @figmaIndex 06-04
|  @desc 
└──────────────────────────────────*/
// router.route('/').post(
//   ...imageUploadPipelineForCreateMeeting,
//   auth(TRole.common),
//   validateRequest(validation.createHelpMessageValidationSchema),
//   controller.create
// );


// router.route('/:id/permenent').delete(
//   auth(TRole.common),
//   controller.deleteById
// );


// router.route('/:id').delete(
//   auth(TRole.common),
//   controller.softDeleteById
// );



export const MeetingRoute = router;
