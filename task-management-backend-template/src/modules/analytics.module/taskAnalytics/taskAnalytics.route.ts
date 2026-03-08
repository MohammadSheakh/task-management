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

export const TaskAnalyticsRoutes = router;
