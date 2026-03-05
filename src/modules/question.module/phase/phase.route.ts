//@ts-ignore
import express from 'express';
import * as validation from './phase.validation';
import { PhaseController} from './phase.controller';
import { IPhase } from './phase.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IPhase | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new PhaseController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-─────────────────────────────────
| Admin | get all question section / phase with question count
|  @figmaIndex 05-03
|  @desc 
└──────────────────────────────────*/
router.route('/question-count').get(
  auth(TRole.admin),
  validateFiltersForQuery(optionValidationChecking(['_id','title', ...paginationOptions])),
  controller.getAllPhaseWithQuestionCount
);
/*-───────────────────────────────── actually it related to QUESTION table ... we can shift this endpoint to question.route.ts
| Admin | get all question and answers by phaseId
|  @figmaIndex 05-03
|  @desc 
└──────────────────────────────────*/
router.route('/question-ans/:phaseId').get(
  auth(TRole.admin, TRole.student), // Adjust guards as needed
  controller.getQuestionsWithAnswersByPhase
);

/*-───────────────────────────────── 
| Student | get all question and possible answers  and student's answer by phaseNumber and assessmentId 
|  @figmaIndex 
|  @desc 
└──────────────────────────────────*/
router.route('/question-with-students-ans').get(
  auth(TRole.student),
  controller.getPhaseQuestionsWithOptionsAndAnswers
);



/*-───────────────────────────────── 
| Student | get all question and student's answer by assessmentId 
|  @figmaIndex 
|  @desc 
└──────────────────────────────────*/
router.route('/question-with-students-ans-only').get(
  auth(TRole.student),
  controller.getPhaseQuestionsWithOnlyStudentAnswers
);


/*-───────────────────────────────── 
| Student | generate ai summary by students question answer ..  
|  @figmaIndex 
|  @desc 
└──────────────────────────────────*/
router.route('/generate-ai-summary').get(
  auth(TRole.student),
  controller.generateAiSummary
);

/*-───────────────────────────────── 
| Student | when student type answer for a question .. for autosave ...  
|  @figmaIndex Exploration Journey Section | After purchase | 8 no. screen
|  @desc 
└──────────────────────────────────*/
router.route('/submit-answer').post(
  auth(TRole.student),
  controller.submitAnswerAutoSaveFeature
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

/*-─────────────────────────────────
| Admin | get all question section / phase
|  @figmaIndex 05-03
|  @desc 
└──────────────────────────────────*/
router.route('/').get(
  auth(TRole.admin),
  controller.getAll
);


/*-─────────────────────────────────
| Admin | create question phase
|  @figmaIndex 05-03
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



export const PhaseRoute = router;
