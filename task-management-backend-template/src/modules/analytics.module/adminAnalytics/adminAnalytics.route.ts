//@ts-ignore
import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { AdminAnalyticsController } from './adminAnalytics.controller';

const router = express.Router();
const controller = new AdminAnalyticsController();

/*-─────────────────────────────────
|  Admin | Admin Analytics | dashboard-section-flow.png | Get complete admin dashboard overview
|  @desc Returns: platform-wide stats, user growth, revenue, task metrics
└──────────────────────────────────*/
router.get('/admin/dashboard',
  auth(TRole.admin),
  controller.getDashboardOverview
);

/*-─────────────────────────────────
|  Admin | Admin Analytics | user-list-flow.png | Get user growth analytics
|  @desc Returns: new user trends, active users, churn rate, subscription stats
└──────────────────────────────────*/
router.get('/admin/user-growth',
  auth(TRole.admin),
  controller.getUserGrowth
);

/*-─────────────────────────────────
|  Admin | Admin Analytics | subscription-flow.png | Get revenue analytics
|  @desc Returns: MRR, ARR, subscription tiers, revenue trends
└──────────────────────────────────*/
router.get('/admin/revenue',
  auth(TRole.admin),
  controller.getRevenueAnalytics
);

/*-─────────────────────────────────
|  Admin | Admin Analytics | dashboard-section-flow.png | Get platform task metrics
|  @desc Returns: total tasks, completion rates, average task duration
└──────────────────────────────────*/
router.get('/admin/task-metrics',
  auth(TRole.admin),
  controller.getTaskMetrics
);

/*-─────────────────────────────────
|  Admin | Admin Analytics | dashboard-section-flow.png | Get user engagement metrics
|  @desc Returns: DAU/MAU, session duration, feature usage, retention
└──────────────────────────────────*/
router.get('/admin/engagement',
  auth(TRole.admin),
  controller.getEngagementMetrics
);

/*-─────────────────────────────────
|  Admin | Admin Analytics | dashboard-section-flow.png | Get user ratio chart data
|  @desc Returns: user activity ratios for charts (daily/weekly/monthly/yearly)
└──────────────────────────────────*/
router.get('/admin/user-ratio',
  auth(TRole.admin),
  controller.getUserRatioChartData
);

export const AdminAnalyticsRoutes = router;
