//@ts-ignore
import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { GroupAnalyticsController } from './groupAnalytics.controller';

const router = express.Router();
const controller = new GroupAnalyticsController();

/*-─────────────────────────────────
|  Group Owner | Group Admin | Analytics | dashboard-flow-01.png | Get group overview
└──────────────────────────────────*/
router.get('/group/:groupId/overview',
  auth(TRole.common),
  controller.getGroupOverview
);

/*-─────────────────────────────────
|  Group Owner | Group Admin | Analytics | team-member-flow-01.png | Get member statistics
└──────────────────────────────────*/
router.get('/group/:groupId/members',
  auth(TRole.common),
  controller.getMemberStats
);

/*-─────────────────────────────────
|  Group Owner | Group Admin | Analytics | dashboard-flow-01.png | Get group leaderboard
└──────────────────────────────────*/
router.get('/group/:groupId/leaderboard',
  auth(TRole.common),
  controller.getLeaderboard
);

/*-─────────────────────────────────
|  Group Owner | Group Admin | Analytics | dashboard-flow-01.png | Get performance metrics
└──────────────────────────────────*/
router.get('/group/:groupId/performance',
  auth(TRole.common),
  controller.getPerformanceMetrics
);

/*-─────────────────────────────────
|  Group Owner | Group Admin | Analytics | dashboard-flow-01.png | Get activity feed
└──────────────────────────────────*/
router.get('/group/:groupId/activity',
  auth(TRole.common),
  controller.getActivityFeed
);

export const GroupAnalyticsRoutes = router;
