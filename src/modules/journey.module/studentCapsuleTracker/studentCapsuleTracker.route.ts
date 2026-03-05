//@ts-ignore
import express from 'express';
import * as validation from './studentCapsuleTracker.validation';
import { StudentCapsuleTrackerController} from './studentCapsuleTracker.controller';
import { IStudentCapsuleTracker } from './studentCapsuleTracker.interface';
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

export const optionValidationChecking = <T extends keyof IStudentCapsuleTracker | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new StudentCapsuleTrackerController();


router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-───────────────────────────────── 
| Student | get capsule introduction by id
|  @figmaIndex Exploration Journey Section | After purchase | 3 no. screen
|  @desc  :id is studentCapsuleTracker Id
└──────────────────────────────────*/
router.route('/:id/introduction').get(
  auth(TRole.common),
  setQueryOptions({
      populate: [
        { 
          path : "capsuleId", 
          select: "capsuleNumber title introDescription introductionVideo",
          populate: { 
            path : "introductionVideo",
            select : "attachment"
          } 
        }
      ],
      select: '-isDeleted -createdAt -updatedAt -title -capsuleNumber -__v -aiSummaryContent -aiSummaryStatus -aiSummaryGeneratedAt'
    }),
  controller.getByIdV2
);

/*-───────────────────────────────── 
| Student | get modules from Student Modules Tracker by capsuleId and logged in student Id
|           Also Student Capsule Tracker Information by capsuleId and logged in student Id
|  @figmaIndex Exploration Journey Section | After purchase | 5 no. screen
|  @desc 
└──────────────────────────────────*/
router.route('/:capsuleId/modules').get(
  auth(TRole.student),  // ROLE MUST BE STUDENT
  controller.getModulesWithTrackerInfo
);

/*-───────────────────────────────── 
| Student | get questions with studentAnswers With Student Modules Tracker Info by capsuleId 
|  @figmaIndex Exploration Journey Section | After purchase | 8 no. screen
|  @desc 
└──────────────────────────────────*/
router.route('/:capsuleId/questions').get(
  auth(TRole.student),
  controller.getQuestionsWithAnswersWithCapsuleTrackerInfo
);

/*-───────────────────────────────── 
| Student | when student type answer for a question .. for autosave ...  
|  @figmaIndex Exploration Journey Section | After purchase | 8 no. screen
|  @desc 
└──────────────────────────────────*/
router.route('/submit-answer/:questionId').post(
  auth(TRole.student),
  controller.submitAnswerAutoSaveFeature
);

/*-───────────────────────────────── 
| Student | change a StudentModuleTracker's Status 'notStarted' -> 'completed'
|  @figmaIndex Exploration Journey Section | After purchase | 6 no. screen
|  @desc 
└──────────────────────────────────*/
router.route('/:capsuleId/module-tracker/:studentModuleTrackerId').put(
  auth(TRole.student),  // ROLE MUST BE STUDENT
  controller.updateModuleTracker
);

/*-───────────────────────────────── 
| Student | if ai summary is already generated for this student capsule
|           then return that .. otherwise .. generate ai summary .. 
|        -- also we need to return 'status' of 'purchased Journey'
|  @figmaIndex Exploration Journey Section | After purchase | 10 no. screen
|  @desc  :id is studentCapsuleTracker Id
└──────────────────────────────────*/
router.route('/:id/ai-summary').get(
  auth(TRole.student),
  controller.getOrGenerateAISummaryWithPurchasedJourneyStatus
);


/*-───────────────────────────────── 
| Student | change 'introStatus' to  'completed' and 'inspirationStatus' to 'inProgress'
|  @figmaIndex Exploration Journey Section | After purchase | 3 no. screen
|  @desc  update status and calculate progressPercentage and update overAllStatus
| ------------------------------------------------------------------------------------
| | 7 no. screen
| need to check StudentCapsuleTracker's 'inspirationStatus' is 'completed'
| if "completed" then change 'diagnosticsStatus' to 'inProgress'  and
| 'currentSection' to "diagnostics"
| so.. 
|   "diagnosticsStatus" : "inProgress",
    "currentSection" : "diagnostics"
| ------------------------------------------------------------------------------------
| | 8 no. screen
    update ::::
|   "diagnosticsStatus" : "completed",
    "scienceStatus" : "inProgress",
    "currentSection" : "science"
| ------------------------------------------------------------------------------------
| | 9 no. screen
| update "studentsAnswer" of studentCapsuleTracker .. which will later go to AI for summary
└──────────────────────────────────*/
router.route('/:id').put(
  auth(TRole.student), // ROLE MUST BE student 
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);


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
//   ...imageUploadPipelineForCreateStudentCapsuleTracker,
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



export const StudentCapsuleTrackerRoute = router;
