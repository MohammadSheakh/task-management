//@ts-ignore
import express from 'express';
import * as validation from './mentorProfile.validation';
import { MentorProfileController} from './mentorProfile.controller';
import { IMentorProfile } from './mentorProfile.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IMentorProfile | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new MentorProfileController();

/*-─────────────────────────────────
|  Admin | get all mentor profile whose haveAdminApproval is "inRequest"
└──────────────────────────────────*/
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', 'haveAdminApproval', ...paginationOptions])),
  setQueryOptions({
      populate: [
        { path: 'userId', select: 'id email role', /* populate: { path : ""} */ },
      ],
      select: 'requestDate isLive haveAdminApproval' //-isDeleted  -updatedAt -__v 
    }),
  controller.getAllWithPaginationV2
);

/*-─────────────────────────────────
|  check status of have admin approval
└──────────────────────────────────*/
router.route('/check-status-of-have-admin-approval').get(
  auth(TRole.mentor),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.checkStatusOfHaveAdminApproval
);



/*-─────────────────────────────────
|  Update Profile Info With Phase Id 
└──────────────────────────────────*/
router.route('/update-mentor-profile').put(
  auth(TRole.mentor),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateMentorProfile
);

/*-─────────────────────────────────
|  request to admin for admin approval
└──────────────────────────────────*/
router.route('/request-for-admin-approval').put(
  auth(TRole.mentor),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.requestForAdminApproval
);

/*-─────────────────────────────────
|  Student | Mentors | 02 | Get a Mentor Information By Id and His all reviews
└──────────────────────────────────*/
router.route('/with-reviews/:mentorId').get(
  auth(TRole.student),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.mentorProfileInfoWithReviews
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

// router.route('/:id/permenent').delete(
//   auth(TRole.common),
//   controller.deleteById
// );

// router.route('/:id').delete(
//   auth(TRole.common),
//   controller.softDeleteById
// );



export const MentorProfileRoute = router;
