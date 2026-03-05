//@ts-ignore
import express from 'express';
import { CalendlyController} from './calendly.controller';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

// const taskService = new TaskService();
const controller = new CalendlyController();

/*-─────────────────────────────────
|  Connect with calendly account for mentor or admin
└──────────────────────────────────*/
// Step 1: Redirect to Calendly OAuth
router.route('/connect').get(
  auth(TRole.common),
  controller.redirectToCalendlyAuth
);

/*-─────────────────────────────────
|  Remove calendly account
└──────────────────────────────────*/
router.route('/delete-subscription').get(
  auth(TRole.common),
  controller.disconnectCalendly
);


/*-─────────────────────────────────
|  Get Admins calendly account for first time meeting as mentor
└──────────────────────────────────*/


/*-─────────────────────────────────
|  Admin |  List meeting templates (event types)
└──────────────────────────────────*/
router.route('/event-types').get(
  auth(TRole.admin, TRole.mentor),
  controller.getEventTypes
);

/*-─────────────────────────────────
|  Admin |  real bookings (scheduled events)
└──────────────────────────────────*/
router.route('/scheduled-events').get(
  auth(TRole.admin, TRole.mentor),
  controller.getScheduledEvents
);

/*-─────────────────────────────────
|  Admin |  Who booked a specific meeting
└──────────────────────────────────*/
router.route('/event-invitees/:eventUuid').get(
  auth(TRole.admin, TRole.mentor),
  controller.getEventInvitees
);


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
//   ...imageUploadPipelineForCreateCalendly,
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



export const CalendlyRoute = router;
