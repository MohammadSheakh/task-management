//@ts-ignore
import express from 'express';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
import { AdminAnalyticsController } from './adminAnalytics.controller';

const router = express.Router();
const controller = new AdminAnalyticsController();

/*-─────────────────────────────────
|  Admin | Analytics | dashboard-section-flow.png | Get complete admin dashboard overview
└──────────────────────────────────*/
router.get('/admin/dashboard',
  auth(TRole.admin),
  controller.getDashboardOverview
);

/*-─────────────────────────────────
|  Admin | Analytics | user-list-flow.png | Get user growth analytics
└──────────────────────────────────*/
router.get('/admin/user-growth',
  auth(TRole.admin),
  controller.getUserGrowth
);

/*-─────────────────────────────────
|  Admin | Analytics | subscription-flow.png | Get revenue analytics
└──────────────────────────────────*/
router.get('/admin/revenue',
  auth(TRole.admin),
  controller.getRevenueAnalytics
);

/*-─────────────────────────────────
|  Admin | Analytics | dashboard-section-flow.png | Get platform task metrics
└──────────────────────────────────*/
router.get('/admin/task-metrics',
  auth(TRole.admin),
  controller.getTaskMetrics
);

/*-─────────────────────────────────
|  Admin | Analytics | dashboard-section-flow.png | Get user engagement metrics
└──────────────────────────────────*/
router.get('/admin/engagement',
  auth(TRole.admin),
  controller.getEngagementMetrics
);

export const AdminAnalyticsRoutes = router;
