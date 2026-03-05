//@ts-ignore
import express from 'express';
import * as validation from './journey.validation';
import { JourneyController} from './journey.controller';
import { IJourney } from './journey.interface';
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

export const optionValidationChecking = <T extends keyof IJourney | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new JourneyController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-───────────────────────────────── 
| Admin | get journey and its capsules
|  @figmaIndex 0-0
|  @desc admin can see a journey details along with its capsules .. 
└──────────────────────────────────*/
router.route('/capsule').get(
  auth(TRole.admin),
  injectUserReference('adminId'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  // controller.create
  controller.getJourneyDetailsWithCapsules
);

/*-───────────────────────────────── 
| Student | check student is purchased or not journey .. if purchased .. return capsules with history
|  @figmaIndex 0-0
|  @desc - if not purchased .. return all capsules
└──────────────────────────────────*/
router.route('/isPurchased').get(
  auth(TRole.student),
  // validateRequest(validation.createHelpMessageValidationSchema),
  // controller.create
  controller.isPurchasedByStudent
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
| Admin | create journey
|  @figmaIndex 06-02
|  @desc here we inject adminId from token using middleware
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.admin),
  injectUserReference('adminId'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  // controller.create
  controller.createOrUpdate
);

router.route('/:id/permenent').delete(
  auth(TRole.common),
  controller.deleteById
);

router.route('/:id').delete(
  auth(TRole.common),
  controller.softDeleteById
);


export const JourneyRoute = router;
