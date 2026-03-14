//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { GenericService } from '../_generic-module/generic.services';
import { ChildrenBusinessUser } from './childrenBusinessUser.model';
import { IChildrenBusinessUser, IChildrenBusinessUserDocument } from './childrenBusinessUser.interface';
import ApiError from '../../errors/ApiError';
import { User } from '../user.module/user/user.model';
import { SubscriptionPlan } from '../subscription.module/subscriptionPlan/subscriptionPlan.model';
import { UserSubscription } from '../subscription.module/userSubscription/userSubscription.model';
import { UserSubscriptionStatusType } from '../subscription.module/userSubscription/userSubscription.constant';
import { CHILDREN_BUSINESS_USER_STATUS, CHILDREN_CACHE_CONFIG } from './childrenBusinessUser.constant';
import { redisClient } from '../../helpers/redis/redis';
import { errorLogger, logger } from '../../shared/logger';
import bcryptjs from 'bcryptjs';

/**
 * Children Business User Service
 * Handles business logic for parent-child relationships
 * 
 * Features:
 * - Create child accounts with subscription limit enforcement
 * - Auto-create family group if not exists
 * - Redis caching for children lists
 * - Automatic cache invalidation
 * 
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class ChildrenBusinessUserService extends GenericService<typeof ChildrenBusinessUser, IChildrenBusinessUserDocument> {
  constructor() {
    super(ChildrenBusinessUser);
  }

  /**
   * Cache Key Generator
   */
  private getCacheKey(type: 'children' | 'count' | 'parent', businessUserId?: string, childUserId?: string): string {
    const prefix = CHILDREN_CACHE_CONFIG.PREFIX;
    if (type === 'children' && businessUserId) {
      return `${prefix}:business:${businessUserId}:children`;
    }
    if (type === 'count' && businessUserId) {
      return `${prefix}:business:${businessUserId}:count`;
    }
    if (type === 'parent' && childUserId) {
      return `${prefix}:child:${childUserId}:parent`;
    }
    return `${prefix}:unknown`;
  }

  /**
   * Get from Cache
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return JSON.parse(cachedData) as T;
      }
      return null;
    } catch (error) {
      errorLogger.error('Redis GET error in ChildrenBusinessUserService:', error);
      return null;
    }
  }

  /**
   * Set in Cache
   */
  private async setInCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      errorLogger.error('Redis SET error in ChildrenBusinessUserService:', error);
    }
  }

  /**
   * Invalidate Cache
   */
  private async invalidateCache(businessUserId: string, childUserId?: string): Promise<void> {
    try {
      const keysToDelete = [
        this.getCacheKey('children', businessUserId),
        this.getCacheKey('count', businessUserId),
      ];

      if (childUserId) {
        keysToDelete.push(this.getCacheKey('parent', undefined, childUserId));
      }

      await redisClient.del(keysToDelete);
      logger.info(`Cache invalidated for business user: ${businessUserId}`);
    } catch (error) {
      errorLogger.error('Cache invalidation error:', error);
    }
  }

  /**
   * Create child account and add to family
   * This is the main method for business users to add children
   *
   * @param businessUserId - The business user creating the child
   * @param childData - Child account details
   * @returns Created child user and relationship
   */
  async createChildAccount(
    businessUserId: string,
    childData: {
      name: string;
      email: string;
      password: string;
      phoneNumber?: string;
    }
  ): Promise<{
    childUser: any;
    relationship: IChildrenBusinessUserDocument;
    familyGroup?: any;
  }> {
    /*-─────────────────────────────────
    |  Step 1: Verify business user exists and is a business user
    └──────────────────────────────────*/
    const businessUser = await User.findById(businessUserId);

    if (!businessUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Business user not found');
    }

    /*-─────────────────────────────────
    |  Step 2: Check if business user has active business subscription
    └──────────────────────────────────*/
    const subscription = await UserSubscription.findOne({
      userId: new Types.ObjectId(businessUserId),
      status: UserSubscriptionStatusType.active,
      isDeleted: false,
    });

    if (!subscription) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You must have an active business subscription to add children accounts'
      );
    }

    /*-─────────────────────────────────
    |  Step 3: Get subscription plan to check max children limit
    └──────────────────────────────────*/
    const plan = await SubscriptionPlan.findById(subscription.subscriptionPlanId);

    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription plan not found');
    }

    // Verify this is a business subscription
    const businessSubscriptionTypes = ['business_starter', 'business_level1', 'business_level2'];
    if (!businessSubscriptionTypes.includes(plan.subscriptionType)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Only business subscriptions can add children accounts'
      );
    }

    /*-─────────────────────────────────
    |  Step 4: Check current children count against subscription limit
    └──────────────────────────────────*/
    const currentChildrenCount = await this.getChildrenCount(businessUserId);

    if (currentChildrenCount >= plan.maxChildrenAccount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `You have reached the maximum limit of ${plan.maxChildrenAccount} children accounts for your ${plan.subscriptionName} subscription. Please upgrade your subscription to add more children.`
      );
    }

    /*-─────────────────────────────────
    |  Step 5: Check if email already exists
    └──────────────────────────────────*/
    const existingUser = await User.findOne({
      email: childData.email.toLowerCase(),
      isDeleted: false,
    });

    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
    }

    /*-─────────────────────────────────
    |  Step 6: Hash password
    └──────────────────────────────────*/
    const hashedPassword = await bcryptjs.hash(childData.password, 12);

    /*-─────────────────────────────────
    |  Step 7: Create child user account
    |  Sets accountCreatorId = businessUserId (as per your requirement)
    └──────────────────────────────────*/
    const childUser = await User.create({
      name: childData.name,
      email: childData.email.toLowerCase(),
      password: hashedPassword,
      phoneNumber: childData.phoneNumber,
      role: 'commonUser', // Child is a common user
      accountCreatorId: new Types.ObjectId(businessUserId), // ✅ KEY FIELD
      profileId: businessUser.profileId, // Use same profile template
      subscriptionType: 'none', // Children don't need individual subscription
      isEmailVerified: false, // Child should verify email
    });

    /*-─────────────────────────────────
    |  Step 8: Create parent-child relationship record
    └──────────────────────────────────*/
    const relationship = await this.model.create({
      parentBusinessUserId: new Types.ObjectId(businessUserId),
      childUserId: childUser._id,
      addedBy: new Types.ObjectId(businessUserId),
      status: CHILDREN_BUSINESS_USER_STATUS.ACTIVE,
    });

    /*-─────────────────────────────────
    |  Step 9: Invalidate cache
    └──────────────────────────────────*/
    await this.invalidateCache(businessUserId);

    /*-─────────────────────────────────
    |  Step 10: Return result (simplified - no group integration)
    └──────────────────────────────────*/
    return {
      childUser: {
        _id: childUser._id,
        name: childUser.name,
        email: childUser.email,
        phoneNumber: childUser.phoneNumber,
        accountCreatorId: childUser.accountCreatorId,
      },
      relationship: {
        _id: relationship._id,
        parentBusinessUserId: relationship.parentBusinessUserId,
        childUserId: relationship.childUserId,
        addedAt: relationship.addedAt,
        status: relationship.status,
      },
    };
  }

  /**
   * Get or create family group for business user
   * REMOVED: No longer using group integration
   * Parent-child relationship is direct via ChildrenBusinessUser model
   */
  // private async getOrCreateFamilyGroup - REMOVED

  /**
   * Add child to family group
   * REMOVED: No longer using group integration
   */
  // private async addChildToGroup - REMOVED

  /** ✔️
   * Get all children of a business user
   */
  async getChildrenOfBusinessUser(
    businessUserId: string,
    options?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const cacheKey = this.getCacheKey('children', businessUserId);

    // Try cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for children list: ${cacheKey}`);
      return cached;
    }

    /*-─────────────────────────────────
    |  Build aggregation pipeline
    └──────────────────────────────────*/
    const matchStage: any = {
      parentBusinessUserId: new Types.ObjectId(businessUserId),
      isDeleted: false,
    };

    if (options?.status) {
      matchStage.status = options.status;
    }

    const children = await this.model.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'childUserId',
          foreignField: '_id',
          as: 'childUser',
        },
      },
      { $unwind: '$childUser' },
      {
        $project: {
          _id: 1,
          relationshipId: '$_id',
          childUserId: '$childUser._id',
          name: '$childUser.name',
          email: '$childUser.email',
          phoneNumber: '$childUser.phoneNumber',
          profileImage: '$childUser.profileImage',
          accountCreatorId: '$childUser.accountCreatorId',
          addedAt: 1,
          status: 1,
          note: 1,
        },
      },
      { $sort: { addedAt: -1 } },
    ]);

    // Cache the result
    await this.setInCache(cacheKey, children, CHILDREN_CACHE_CONFIG.CHILDREN_LIST_TTL);

    return children;
  }

  /** ✔️
   * Get children count for business user
   */
  async getChildrenCount(businessUserId: string): Promise<number> {
    const cacheKey = this.getCacheKey('count', businessUserId);

    // Try cache first
    const cached = await this.getFromCache<number>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for children count: ${cacheKey}`);
      return cached;
    }

    const count = await this.model.countDocuments({
      parentBusinessUserId: new Types.ObjectId(businessUserId),
      status: CHILDREN_BUSINESS_USER_STATUS.ACTIVE,
      isDeleted: false,
    });

    // Cache the result
    await this.setInCache(cacheKey, count, CHILDREN_CACHE_CONFIG.COUNT_TTL);

    return count;
  }

  /** ✔️
   * Get parent business user for a child
   */
  async getParentBusinessUser(childUserId: string): Promise<any> {
    const cacheKey = this.getCacheKey('parent', undefined, childUserId);

    // Try cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for parent info: ${cacheKey}`);
      return cached;
    }

    const relationship: IChildrenBusinessUser = await this.model.findOne({
      childUserId: new Types.ObjectId(childUserId),
      status: CHILDREN_BUSINESS_USER_STATUS.ACTIVE,
      isDeleted: false,
    }).populate('parentBusinessUserId', 'name email phoneNumber profileImage subscriptionType');

    if (!relationship) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No parent business user found for this child');
    }

    const parentInfo = {
      _id: (relationship.parentBusinessUserId as any)._id,
      name: (relationship.parentBusinessUserId as any).name,
      email: (relationship.parentBusinessUserId as any).email,
      phoneNumber: (relationship.parentBusinessUserId as any).phoneNumber,
      profileImage: (relationship.parentBusinessUserId as any).profileImage,
      subscriptionType: (relationship.parentBusinessUserId as any).subscriptionType,
    };

    // Cache the result
    await this.setInCache(cacheKey, parentInfo, CHILDREN_CACHE_CONFIG.PARENT_INFO_TTL);

    return parentInfo;
  }

  /** ✔️
   * Remove child from family (soft delete)
   */
  async removeChildFromFamily(
    businessUserId: string,
    childUserId: string,
    note?: string
  ): Promise<void> {
    // Find and update relationship
    const relationship = await this.model.findOneAndUpdate(
      {
        parentBusinessUserId: new Types.ObjectId(businessUserId),
        childUserId: new Types.ObjectId(childUserId),
        isDeleted: false,
      },
      {
        status: CHILDREN_BUSINESS_USER_STATUS.REMOVED,
        isDeleted: true,
        note: note,
      },
      { new: true }
    );

    if (!relationship) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'No active relationship found between this business user and child'
      );
    }

    // REMOVED: No group integration
    // Parent-child relationship is direct via ChildrenBusinessUser model

    /*-─────────────────────────────────
    |  NEED TO THINK : what should be the flow after softDelete the relationship
    └──────────────────────────────────*/

    // Invalidate cache
    await this.invalidateCache(businessUserId, childUserId);

    logger.info(`Removed child ${childUserId} from business user ${businessUserId}`);
  }

  /**
   * Reactivate child account
   */
  async reactivateChild(
    businessUserId: string,
    childUserId: string
  ): Promise<void> {
    await this.model.findOneAndUpdate(
      {
        parentBusinessUserId: new Types.ObjectId(businessUserId),
        childUserId: new Types.ObjectId(childUserId),
        isDeleted: true,
      },
      {
        status: CHILDREN_BUSINESS_USER_STATUS.ACTIVE,
        isDeleted: false,
        note: 'Reactivated',
      }
    );

    // REMOVED: No group integration
    // Parent-child relationship is direct via ChildrenBusinessUser model

    await this.invalidateCache(businessUserId, childUserId);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Secondary User Management
  // Figma: dashboard-flow-03.png (Permissions section)
  // Only ONE child per business user can be Secondary User
  // ────────────────────────────────────────────────────────────────────────

  /**✔️
   * Set/Unset child as Secondary User
   * Only ONE child per business user can be Secondary User
   * 
   * @param businessUserId - Parent/Teacher business user ID
   * @param childUserId - Child user ID
   * @param isSecondaryUser - true to set, false to unset
   * @returns Updated secondary user status
   */
  async setSecondaryUser(
    businessUserId: string,
    childUserId: string,
    isSecondaryUser: boolean
  ): Promise<{
    childUserId: string;
    isSecondaryUser: boolean;
    updatedAt: Date;
  }> {
    // If setting as secondary user, ensure no other child is already secondary
    if (isSecondaryUser) {
      const existingSecondary = await this.model.findOne({
        parentBusinessUserId: new Types.ObjectId(businessUserId),
        isSecondaryUser: true,
        childUserId: { $ne: new Types.ObjectId(childUserId) },
        isDeleted: false,
      });

      if (existingSecondary) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Another child is already the Secondary User. Please remove them first.'
        );
      }
    }

    const result = await this.model.findOneAndUpdate(
      {
        parentBusinessUserId: new Types.ObjectId(businessUserId),
        childUserId: new Types.ObjectId(childUserId),
        isDeleted: false,
      },
      { isSecondaryUser },
      { new: true, runValidators: true }
    ).select('isSecondaryUser updatedAt');

    if (!result) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Child account not found or not associated with this business user'
      );
    }

    // Invalidate cache
    await this.invalidateCache(businessUserId, childUserId);

    logger.info(`Set child ${childUserId} as Secondary User: ${isSecondaryUser}`);

    return {
      childUserId,
      isSecondaryUser,
      updatedAt: result.updatedAt,
    };
  }

  /** ✔️
   * Get Secondary User for a business user
   * 
   * @param businessUserId - Business user ID
   * @returns Secondary user info or null if none
   */
  async getSecondaryUser(businessUserId: string): Promise<{
    childUserId: string | null;
    isSecondaryUser: boolean;
  } | null> {
    const relationship = await this.model.findOne({
      parentBusinessUserId: new Types.ObjectId(businessUserId),
      isSecondaryUser: true,
      isDeleted: false,
      status: CHILDREN_BUSINESS_USER_STATUS.ACTIVE,
    }).select('childUserId').lean();

    if (!relationship) {
      return null;
    }

    return {
      childUserId: relationship.childUserId.toString(),
      isSecondaryUser: true,
    };
  }

  /**✔️
   * Check if a child is Secondary User
   * 
   * @param childUserId - Child user ID
   * @returns true if child is Secondary User
   */
  async isChildSecondaryUser(childUserId: string): Promise<boolean> {
    const relationship = await this.model.exists({
      childUserId: new Types.ObjectId(childUserId),
      isSecondaryUser: true,
      isDeleted: false,
      status: CHILDREN_BUSINESS_USER_STATUS.ACTIVE,
    });

    return !!relationship;
  }
}