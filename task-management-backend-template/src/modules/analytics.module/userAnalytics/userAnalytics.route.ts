//@ts-ignore
import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { UserAnalyticsController } from './userAnalytics.controller';

const router = express.Router();

const controller = new UserAnalyticsController();

/*-─────────────────────────────────
|  User | Analytics | 03-01 | Get complete user analytics overview
|  @figmaIndex home-flow.png
|  @desc Returns: overview, today's progress, weekly/monthly stats, streak, productivity score
└──────────────────────────────────*/
router.get('/user/my/overview',
  auth(TRole.common),
  controller.getUserOverview
);

/*-─────────────────────────────────
|  User | Analytics | 03-01 | Get today's task progress
|  @figmaIndex home-flow.png (Daily Progress section)
|  @desc Returns: X/Y completed format, completion rate
└──────────────────────────────────*/
router.get('/user/my/daily-progress',
  auth(TRole.common),
  controller.getDailyProgress
);

/*-─────────────────────────────────
|  User | Analytics | 06-03 | Get user's streak data
|  @figmaIndex profile-permission-account-interface.png
|  @desc Returns: current streak, longest streak, streak history
└──────────────────────────────────*/
router.get('/user/my/weekly-streak',
  auth(TRole.common),
  controller.getStreak
);

/*-─────────────────────────────────
|  User | Analytics | 06-03 | Get user's productivity score
|  @figmaIndex profile-permission-account-interface.png
|  @desc Returns: score (0-100), breakdown, trend, percentile
└──────────────────────────────────*/
router.get('/user/my/productivity-score',
  auth(TRole.common),
  controller.getProductivityScore
);

/*-─────────────────────────────────
|  User | Analytics | 06-03 | Get user's completion rate analytics
|  @figmaIndex profile-permission-account-interface.png
|  @desc Returns: overall rate, by time range, trend
└──────────────────────────────────*/
router.get('/user/my/completion-rate',
  auth(TRole.common),
  controller.getCompletionRate
);

/*-─────────────────────────────────
|  User | Analytics | 03-01 | Get user's task statistics
|  @figmaIndex status-section-flow-01.png
|  @desc Returns: tasks by status, priority, task type
└──────────────────────────────────*/
router.get('/user/my/task-statistics',
  auth(TRole.common),
  controller.getTaskStatistics
);

/*-─────────────────────────────────
|  User | Analytics | 03-01 | Get user's trend analytics
|  @figmaIndex history_screen.dart
|  @desc Returns: daily/weekly/monthly trend data
└──────────────────────────────────*/
router.get('/user/my/trend',
  auth(TRole.common),
  controller.getTrendAnalytics
);

export const UserAnalyticsRoutes = router;
