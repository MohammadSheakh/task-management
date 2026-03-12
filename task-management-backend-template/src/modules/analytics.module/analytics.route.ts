/**
 * Analytics Module - Main Routes
 * Combines all analytics sub-module routes
 * 
 * @version 2.0.0 - Added Chart Aggregation endpoints
 * @date: 12-03-26
 * @author Senior Engineering Team
 */

//@ts-ignore
import express from 'express';
import { UserAnalyticsRoutes } from './userAnalytics/userAnalytics.route';
import { TaskAnalyticsRoutes } from './taskAnalytics/taskAnalytics.route';
import { GroupAnalyticsRoutes } from './groupAnalytics/groupAnalytics.route';
import { AdminAnalyticsRoutes } from './adminAnalytics/adminAnalytics.route';
import { ChartAggregationRoutes } from './chartAggregation/chartAggregation.route';

const router = express.Router();

// Use all sub-module routes
router.use(UserAnalyticsRoutes);
router.use(TaskAnalyticsRoutes);
router.use(GroupAnalyticsRoutes);
router.use(AdminAnalyticsRoutes);

// Chart-specific aggregation endpoints (NEW - for Figma dashboard charts)
router.use('/charts', ChartAggregationRoutes);

export const AnalyticsRoutes = router;
