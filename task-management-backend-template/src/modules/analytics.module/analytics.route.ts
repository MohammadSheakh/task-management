/**
 * Analytics Module - Main Routes
 * Combines all analytics sub-module routes
 * 
 * @version 1.0.0
 * @author Senior Engineering Team
 */

//@ts-ignore
import express from 'express';
import { UserAnalyticsRoutes } from './userAnalytics/userAnalytics.route';
import { TaskAnalyticsRoutes } from './taskAnalytics/taskAnalytics.route';
import { GroupAnalyticsRoutes } from './groupAnalytics/groupAnalytics.route';
import { AdminAnalyticsRoutes } from './adminAnalytics/adminAnalytics.route';

const router = express.Router();

// Use all sub-module routes
router.use(UserAnalyticsRoutes);
router.use(TaskAnalyticsRoutes);
router.use(GroupAnalyticsRoutes);
router.use(AdminAnalyticsRoutes);

export const AnalyticsRoutes = router;
