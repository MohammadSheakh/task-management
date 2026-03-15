//@ts-ignore
import { Types } from 'mongoose';
import { redisClient } from '../../../helpers/redis/redis';
import { logger, errorLogger } from '../../../shared/logger';
import { User } from '../../user.module/user/user.model';
import { Task } from '../../task.module/task/task.model';
// ❌ REMOVED: Group module not needed
// import { Group } from '../../group.module/group/group.model';
import {
  IAdminDashboardAnalytics,
  IPlatformOverview,
  IUserGrowthAnalytics,
  IRevenueAnalytics,
  IPlatformTaskMetrics,
  IUserEngagementMetrics,
  IUserRatioChartData,
} from './adminAnalytics.interface';
import { ANALYTICS_CACHE_CONFIG, ADMIN_METRICS_CONFIG } from '../analytics.constant';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  format,
  eachDayOfInterval,
} from 'date-fns';

/**
 * Admin Analytics Service
 * Platform-wide analytics for administrators
 */
export class AdminAnalyticsService {
  private getCacheKey(type: string): string {
    return `${ANALYTICS_CACHE_CONFIG.PREFIX}:admin:${type}`;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await redisClient.get(key);
      return cachedData ? JSON.parse(cachedData) as T : null;
    } catch (error) {
      errorLogger.error('Redis GET error in AdminAnalytics:', error);
      return null;
    }
  }

  private async setInCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      errorLogger.error('Redis SET error in AdminAnalytics:', error);
    }
  }

  async getDashboardOverview(): Promise<IAdminDashboardAnalytics> {
    const cacheKey = this.getCacheKey('dashboard');
    
    const cached = await this.getFromCache<IAdminDashboardAnalytics>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    // Get platform overview
    const [totalUsers, totalTasks] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Task.countDocuments({ isDeleted: false }),
    ]);

    const overview: IPlatformOverview = {
      totalUsers,
      totalGroups: 0, // ❌ REMOVED: Group module not needed
      totalTasks,
      activeUsersToday: 0,
      activeUsersThisWeek: 0,
      activeUsersThisMonth: 0,
      dauMauRatio: 0,
    };

    const dashboard: IAdminDashboardAnalytics = {
      overview,
      userGrowth: await this.getUserGrowth(),
      revenue: await this.getRevenueAnalytics(),
      taskMetrics: await this.getTaskMetrics(),
      engagement: await this.getEngagementMetrics(),
      topGroups: [],
      recentUsers: [],
      lastUpdated: new Date(),
    };

    await this.setInCache(cacheKey, dashboard, ANALYTICS_CACHE_CONFIG.ADMIN_DASHBOARD);
    return dashboard;
  }

  async getUserGrowth(): Promise<IUserGrowthAnalytics> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [todayCount, weekCount, monthCount] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
        isDeleted: false,
      }),
      User.countDocuments({
        createdAt: { $gte: weekStart, $lte: now },
        isDeleted: false,
      }),
      User.countDocuments({
        createdAt: { $gte: monthStart, $lte: now },
        isDeleted: false,
      }),
    ]);

    // Get historical data (last 30 days)
    const history = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: subDays(now, 30), $lte: now },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const historyData = history.map((h: any) => ({
      date: format(new Date(h._id.year, h._id.month - 1, h._id.day), 'yyyy-MM-dd'),
      totalUsers: 0,
      newUsers: h.newUsers,
    }));

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      growthRate: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
      history: historyData,
    };
  }

  async getRevenueAnalytics(): Promise<IRevenueAnalytics> {
    // Simplified - would integrate with payment.module
    return {
      mrr: 0,
      arr: 0,
      thisMonth: 0,
      lastMonth: 0,
      growthRate: 0,
      bySubscriptionType: {
        individual: { count: 0, revenue: 0 },
        group: { count: 0, revenue: 0 },
      },
      history: [],
    };
  }

  async getTaskMetrics(): Promise<IPlatformTaskMetrics> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const todayStats = await Task.aggregate([
      {
        $match: {
          startTime: { $gte: todayStart, $lte: todayEnd },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const allTimeStats = await Task.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    const createdToday = todayStats.reduce((sum: number, s: any) => sum + s.count, 0);
    const completedToday = todayStats.find((s: any) => s._id === 'completed')?.count || 0;

    return {
      createdToday,
      completedToday,
      completionRate: createdToday > 0 ? (completedToday / createdToday) * 100 : 0,
      averageTasksPerUser: 0,
      byStatus: {
        pending: 0,
        inProgress: 0,
        completed: allTimeStats[0]?.completed || 0,
      },
      byTaskType: {
        personal: 0,
        singleAssignment: 0,
        collaborative: 0,
      },
      trend: {
        direction: 'stable',
        percentageChange: 0,
        period: 'day',
      },
    };
  }

  async getEngagementMetrics(): Promise<IUserEngagementMetrics> {
    return {
      dau: 0,
      mau: 0,
      dauMauRatio: 0,
      averageSessionDuration: 0,
      sessionsPerUser: 0,
      retentionRate: {
        day1: 0,
        day7: 0,
        day30: 0,
      },
    };
  }

  async getUserRatioChartData(
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<IUserRatioChartData> {
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let groupBy: any;

    // Determine date range and grouping based on type
    switch (type) {
      case 'daily':
        startDate = subDays(now, 7);
        dateFormat = 'HH:mm';
        groupBy = {
          hour: { $hour: '$createdAt' },
          minute: { $minute: '$createdAt' },
        };
        break;
      case 'weekly':
        startDate = subDays(now, 28); // 4 weeks
        dateFormat = 'EEEE';
        groupBy = {
          dayOfWeek: { $dayOfWeek: '$createdAt' },
        };
        break;
      case 'yearly':
        startDate = subMonths(now, 12);
        dateFormat = 'MMM yyyy';
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
      case 'monthly':
      default:
        startDate = subMonths(now, 6); // 6 months
        dateFormat = 'MMM dd';
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
    }

    // Aggregate user data
    const aggregationPipeline = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: groupBy,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $gt: ['$lastActiveAt', startDate] }, 1, 0] },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
    ]);

    // Transform aggregation results
    const data = aggregationPipeline.map((item: any) => {
      const date = new Date(
        item._id.year || now.getFullYear(),
        item._id.month ? item._id.month - 1 : now.getMonth(),
        item._id.day || now.getDate(),
        item._id.hour || 0,
        item._id.minute || 0
      );

      const totalUsers = item.totalUsers || 0;
      const activeUsers = item.activeUsers || 0;
      const inactiveUsers = totalUsers - activeUsers;
      const activityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

      return {
        period: format(date, dateFormat),
        totalUsers,
        activeUsers,
        newUsers: item.newUsers || 0,
        inactiveUsers,
        activityRate: Math.round(activityRate * 100) / 100,
      };
    });

    // Calculate summary statistics
    const totalUsers = data.reduce((sum, item) => sum + item.totalUsers, 0);
    const avgActiveUsers =
      data.length > 0
        ? data.reduce((sum, item) => sum + item.activeUsers, 0) / data.length
        : 0;
    const avgActivityRate =
      data.length > 0
        ? data.reduce((sum, item) => sum + item.activityRate, 0) / data.length
        : 0;

    // Determine trend (compare first half vs second half)
    const midpoint = Math.floor(data.length / 2);
    const firstHalfAvg =
      midpoint > 0
        ? data.slice(0, midpoint).reduce((sum, item) => sum + item.activityRate, 0) / midpoint
        : 0;
    const secondHalfAvg =
      midpoint > 0
        ? data.slice(midpoint).reduce((sum, item) => sum + item.activityRate, 0) /
          (data.length - midpoint)
        : avgActivityRate;

    const percentageChange =
      firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trend: 'increasing' | 'decreasing' | 'stable' =
      percentageChange > 5 ? 'increasing' : percentageChange < -5 ? 'decreasing' : 'stable';

    return {
      type,
      data,
      summary: {
        totalUsers,
        averageActiveUsers: Math.round(avgActiveUsers * 100) / 100,
        averageActivityRate: Math.round(avgActivityRate * 100) / 100,
        trend,
        percentageChange: Math.round(percentageChange * 100) / 100,
      },
    };
  }

  async getCohortAnalysis(months: number = 6): Promise<any[]> {
    return [];
  }

  async getChurnAnalytics(period: 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
    return { period, totalChurnedUsers: 0, churnRate: 0, trends: [] };
  }

  async getPredictiveAnalytics(months: number = 3): Promise<any> {
    return { forecast: [], insights: [] };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
