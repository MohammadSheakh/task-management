//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { redisClient } from '../../../helpers/redis/redis';
import { logger, errorLogger } from '../../../shared/logger';
import { Task } from '../../task.module/task/task.model';
import { Group } from '../../group.module/group/group.model';
import { GroupMember } from '../../group.module/groupMember/groupMember.model';
import {
  IStatusDistribution,
  ITaskOverviewAnalytics,
  IGroupTaskAnalytics,
  IDailyTaskSummary,
  ICompletionTrendPoint,
} from './taskAnalytics.interface';
import {
  ANALYTICS_CACHE_CONFIG,
  TAnalyticsTimeRange,
} from '../analytics.constant';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from 'date-fns';

/**
 * Task Analytics Service
 * Handles task-level analytics with Redis caching
 * 
 * @version 1.0.0
 */
export class TaskAnalyticsService {
  private getCacheKey(type: string, id?: string): string {
    if (id) {
      return `${ANALYTICS_CACHE_CONFIG.PREFIX}:task:${id}:${type}`;
    }
    return `${ANALYTICS_CACHE_CONFIG.PREFIX}:task:${type}`;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return JSON.parse(cachedData) as T;
      }
      return null;
    } catch (error) {
      errorLogger.error('Redis GET error in TaskAnalytics:', error);
      return null;
    }
  }

  private async setInCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      errorLogger.error('Redis SET error in TaskAnalytics:', error);
    }
  }

  /**
   * Get Platform-wide Task Overview
   */
  async getOverview(): Promise<ITaskOverviewAnalytics> {
    const cacheKey = this.getCacheKey('overview');
    
    const cached = await this.getFromCache<ITaskOverviewAnalytics>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Get today's stats
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

    // Get all-time stats for averages
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

    const totalToday = todayStats.reduce((sum: number, s: any) => sum + s.count, 0);
    const completedToday = todayStats.find((s: any) => s._id === 'completed')?.count || 0;
    const pendingToday = todayStats.find((s: any) => s._id === 'pending')?.count || 0;

    const allTimeTotal = allTimeStats[0]?.total || 0;
    const allTimeCompleted = allTimeStats[0]?.completed || 0;
    const daysSinceStart = Math.max(1, Math.ceil((now.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)));

    const analytics: ITaskOverviewAnalytics = {
      totalTasks: allTimeTotal,
      completedToday,
      pendingToday,
      completionRate: totalToday > 0 ? (completedToday / totalToday) * 100 : 0,
      averageTasksPerDay: Math.round(allTimeTotal / daysSinceStart),
      streak: {
        current: 0,  // Would calculate from historical data
        longest: 0,
      },
    };

    await this.setInCache(cacheKey, analytics, ANALYTICS_CACHE_CONFIG.TASK_OVERVIEW);
    return analytics;
  }

  /**
   * Get Status Distribution
   */
  async getStatusDistribution(filters?: any): Promise<IStatusDistribution> {
    const cacheKey = this.getCacheKey('status-dist', filters?.groupId || 'global');
    
    const cached = await this.getFromCache<IStatusDistribution>(cacheKey);
    if (cached) {
      return cached;
    }

    const matchStage: any = { isDeleted: false };
    
    if (filters?.groupId) {
      matchStage.groupId = new Types.ObjectId(filters.groupId);
    }
    
    if (filters?.userId) {
      matchStage.$or = [
        { ownerUserId: new Types.ObjectId(filters.userId) },
        { assignedUserIds: new Types.ObjectId(filters.userId) },
      ];
    }

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum: number, s: any) => sum + s.count, 0);

    const notStarted = stats.find((s: any) => s._id === 'pending')?.count || 0;
    const inProgress = stats.find((s: any) => s._id === 'inProgress')?.count || 0;
    const completed = stats.find((s: any) => s._id === 'completed')?.count || 0;

    const distribution: IStatusDistribution = {
      totalTasks: total,
      distribution: {
        notStarted: {
          count: notStarted,
          percentage: total > 0 ? (notStarted / total) * 100 : 0,
        },
        inProgress: {
          count: inProgress,
          percentage: total > 0 ? (inProgress / total) * 100 : 0,
        },
        completed: {
          count: completed,
          percentage: total > 0 ? (completed / total) * 100 : 0,
        },
      },
      overdueTasks: 0,  // Would calculate from due dates
      dueToday: 0,
    };

    await this.setInCache(cacheKey, distribution, ANALYTICS_CACHE_CONFIG.TASK_STATUS_DIST);
    return distribution;
  }

  /**
   * Get Group Task Analytics
   */
  async getGroupTaskAnalytics(groupId: Types.ObjectId): Promise<IGroupTaskAnalytics> {
    const cacheKey = this.getCacheKey('group', groupId.toString());
    
    const cached = await this.getFromCache<IGroupTaskAnalytics>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get group info
    const group = await Group.findById(groupId).select('name').lean();
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Group not found');
    }

    // Get task stats for group
    const statusDist = await this.getStatusDistribution({ groupId: groupId.toString() });

    // Get member stats
    const memberStats = await GroupMember.aggregate([
      {
        $match: { groupId, isDeleted: false },
      },
      {
        $lookup: {
          from: 'tasks',
          let: { memberId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$ownerUserId', '$$memberId'] },
                    { $in: ['$$memberId', '$assignedUserIds'] },
                  ],
                },
                groupId,
                isDeleted: false,
              },
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          as: 'taskStats',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]);

    const analytics: IGroupTaskAnalytics = {
      groupId,
      groupName: group.name,
      totalTasks: statusDist.totalTasks,
      statusDistribution: statusDist.distribution,
      byPriority: {
        low: { count: 0, percentage: 0 },
        medium: { count: 0, percentage: 0 },
        high: { count: 0, percentage: 0 },
      },
      byTaskType: {
        personal: { count: 0, percentage: 0 },
        singleAssignment: { count: 0, percentage: 0 },
        collaborative: { count: 0, percentage: 0 },
      },
      memberStats: memberStats.map((m: any) => ({
        memberId: m.userId,
        memberName: m.user.name,
        tasksAssigned: m.taskStats?.reduce((sum: number, s: any) => sum + s.count, 0) || 0,
        tasksCompleted: m.taskStats?.find((s: any) => s._id === 'completed')?.count || 0,
        completionRate: 0,
      })),
      overdueTasks: 0,
      dueToday: 0,
      averageCompletionTime: 0,
    };

    await this.setInCache(cacheKey, analytics, ANALYTICS_CACHE_CONFIG.TASK_OVERVIEW);
    return analytics;
  }

  /**
   * Get Completion Trend
   */
  async getCompletionTrend(range: TAnalyticsTimeRange): Promise<ICompletionTrendPoint[]> {
    // Implementation for trend data
    return [];
  }

  /**
   * Get Daily Summary
   */
  async getDailySummary(date?: Date): Promise<IDailyTaskSummary> {
    const targetDate = date || new Date();
    const cacheKey = this.getCacheKey('daily-summary', format(targetDate, 'yyyy-MM-dd'));
    
    const cached = await this.getFromCache<IDailyTaskSummary>(cacheKey);
    if (cached) {
      return cached;
    }

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const stats = await Task.aggregate([
      {
        $match: {
          startTime: { $gte: dayStart, $lte: dayEnd },
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

    const total = stats.reduce((sum: number, s: any) => sum + s.count, 0);
    const completed = stats.find((s: any) => s._id === 'completed')?.count || 0;

    const summary: IDailyTaskSummary = {
      date: format(targetDate, 'yyyy-MM-dd'),
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: stats.find((s: any) => s._id === 'pending')?.count || 0,
      inProgressTasks: stats.find((s: any) => s._id === 'inProgress')?.count || 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };

    await this.setInCache(cacheKey, summary, ANALYTICS_CACHE_CONFIG.TASK_DAILY_SUMMARY);
    return summary;
  }

  /**
   * Get Task Activity
   */
  async getTaskActivity(range: TAnalyticsTimeRange): Promise<any[]> {
    return [];
  }
}

export const taskAnalyticsService = new TaskAnalyticsService();
