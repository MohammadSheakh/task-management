//@ts-ignore
import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { TaskAnalyticsController } from './taskAnalytics.controller';

const router = express.Router();
const controller = new TaskAnalyticsController();

/*-─────────────────────────────────
|  Admin | User | Analytics | 03-01 | Get platform-wide task overview
└──────────────────────────────────*/
router.get('/task/overview',
  auth(TRole.common),
  controller.getOverview
);

/*-─────────────────────────────────
|  Admin | User | Group Member | Analytics | 03-01 | Get task status distribution
└──────────────────────────────────*/
router.get('/task/status-distribution',
  auth(TRole.common),
  controller.getStatusDistribution
);

/*-─────────────────────────────────
|  Group Owner | Group Admin | Analytics | dashboard-flow-01.png | Get group task analytics
└──────────────────────────────────*/
router.get('/task/group/:groupId',
  auth(TRole.common),
  controller.getGroupTaskAnalytics
);

/*-─────────────────────────────────
|  Admin | User | Analytics | 03-01 | Get daily task summary
└──────────────────────────────────*/
router.get('/task/daily-summary',
  auth(TRole.common),
  controller.getDailySummary
);

/*-─────────────────────────────────
|  Parent | 01-XX | Get collaborative task progress
|  Role: Business User | Module: Analytics
|  Action: See which children completed/started/not started
|  Auth: Required
|  Figma: task-details-with-subTasks.png
└──────────────────────────────────*/
router.get('/task/:taskId/collaborative-progress',
  auth(TRole.commonUser),
  controller.getCollaborativeTaskProgress
);

/*-─────────────────────────────────
|  Parent | 01-XX | Get child's performance
|  Role: Business User | Module: Analytics
|  Action: View child's task performance analytics
|  Auth: Required
|  Figma: team-member-flow-01.png
└──────────────────────────────────*/
router.get('/child/:childId/performance',
  auth(TRole.commonUser),
  controller.getChildPerformance
);

/*-─────────────────────────────────
|  Parent | 01-XX | Get parent dashboard overview
|  Role: Business User | Module: Analytics
|  Action: View all children's performance overview
|  Auth: Required
|  Figma: dashboard-flow-01.png
└──────────────────────────────────*/
router.get('/parent/my-children/overview',
  auth(TRole.commonUser),
  controller.getParentDashboardOverview
);

export const TaskAnalyticsRoutes = router;
