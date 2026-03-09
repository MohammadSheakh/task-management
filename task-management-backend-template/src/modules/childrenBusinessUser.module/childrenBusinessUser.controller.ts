//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { CatchAsync } from '../../../shared/catchAsync';
import { SuccessResponse } from '../../../shared/SuccessResponse';
import { ChildrenBusinessUserService } from './childrenBusinessUser.service';
import { pick } from '../../../shared/pick';
import { IChildrenBusinessUser } from './childrenBusinessUser.interface';
import { IChildrenBusinessUserQueryOptions } from './childrenBusinessUser.interface';
import { CHILDREN_BUSINESS_USER_STATUS } from './childrenBusinessUser.constant';

/**
 * Children Business User Controller
 * Handles HTTP requests for children business user operations
 * 
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export class ChildrenBusinessUserController {
  private service: ChildrenBusinessUserService;

  constructor() {
    this.service = new ChildrenBusinessUserService();
  }

  /**
   * Create child account
   * POST /children-business-users/children
   * 
   * @description Business user creates a child account and adds to family
   * @auth Business user with active business subscription
   */
  createChild = CatchAsync(async (req: any, res: any) => {
    // ─────────────────────────────────────────────────────────────
    // Step 1: Get business user ID from request
    // ─────────────────────────────────────────────────────────────
    const businessUserId = (req as any).user.userId;

    // ─────────────────────────────────────────────────────────────
    // Step 2: Extract child data from request body
    // ─────────────────────────────────────────────────────────────
    const childData = pick(req.body, ['name', 'email', 'password', 'phoneNumber']);

    // ─────────────────────────────────────────────────────────────
    // Step 3: Call service to create child account
    // ─────────────────────────────────────────────────────────────
    const result = await this.service.createChildAccount(businessUserId, childData);

    // ─────────────────────────────────────────────────────────────
    // Step 4: Send success response
    // ─────────────────────────────────────────────────────────────
    new SuccessResponse(
      StatusCodes.CREATED,
      'Child account created successfully and added to family',
      result
    ).send(res);
  });

  /**
   * Get all children of business user
   * GET /children-business-users/my-children
   * 
   * @description Get all children accounts for the authenticated business user
   * @auth Business user
   */
  getMyChildren = CatchAsync(async (req: any, res: any) => {
    // ─────────────────────────────────────────────────────────────
    // Step 1: Get business user ID from request
    // ─────────────────────────────────────────────────────────────
    const businessUserId = (req as any).user.userId;

    // ─────────────────────────────────────────────────────────────
    // Step 2: Extract query parameters
    // ─────────────────────────────────────────────────────────────
    const options: IChildrenBusinessUserQueryOptions = {
      status: req.query.status as any,
      page: req.query.page ? parseInt(req.query.page) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      sortBy: req.query.sortBy || '-addedAt',
    };

    // ─────────────────────────────────────────────────────────────
    // Step 3: Get children from service
    // ─────────────────────────────────────────────────────────────
    const children = await this.service.getChildrenOfBusinessUser(
      businessUserId,
      options
    );

    // ─────────────────────────────────────────────────────────────
    // Step 4: Get children count
    // ─────────────────────────────────────────────────────────────
    const count = await this.service.getChildrenCount(businessUserId);

    // ─────────────────────────────────────────────────────────────
    // Step 5: Send success response
    // ─────────────────────────────────────────────────────────────
    new SuccessResponse(
      StatusCodes.OK,
      'Children retrieved successfully',
      {
        children,
        count,
      }
    ).send(res);
  });

  /**
   * Get parent business user (for children)
   * GET /children-business-users/my-parent
   * 
   * @description Get the parent business user for the authenticated child
   * @auth Child user
   */
  getParentBusinessUser = CatchAsync(async (req: any, res: any) => {
    // ─────────────────────────────────────────────────────────────
    // Step 1: Get child user ID from request
    // ─────────────────────────────────────────────────────────────
    const childUserId = (req as any).user.userId;

    // ─────────────────────────────────────────────────────────────
    // Step 2: Get parent business user
    // ─────────────────────────────────────────────────────────────
    const parentInfo = await this.service.getParentBusinessUser(childUserId);

    // ─────────────────────────────────────────────────────────────
    // Step 3: Send success response
    // ─────────────────────────────────────────────────────────────
    new SuccessResponse(
      StatusCodes.OK,
      'Parent business user retrieved successfully',
      parentInfo
    ).send(res);
  });

  /**
   * Remove child from family
   * DELETE /children-business-users/children/:childId
   * 
   * @description Remove a child account from the family (soft delete)
   * @auth Business user
   */
  removeChild = CatchAsync(async (req: any, res: any) => {
    // ─────────────────────────────────────────────────────────────
    // Step 1: Get business user ID and child ID
    // ─────────────────────────────────────────────────────────────
    const businessUserId = (req as any).user.userId;
    const childUserId = req.params.childId;

    // ─────────────────────────────────────────────────────────────
    // Step 2: Extract optional note
    // ─────────────────────────────────────────────────────────────
    const note = req.body.note;

    // ─────────────────────────────────────────────────────────────
    // Step 3: Remove child from family
    // ─────────────────────────────────────────────────────────────
    await this.service.removeChildFromFamily(businessUserId, childUserId, note);

    // ─────────────────────────────────────────────────────────────
    // Step 4: Send success response
    // ─────────────────────────────────────────────────────────────
    new SuccessResponse(
      StatusCodes.OK,
      'Child removed from family successfully',
      null
    ).send(res);
  });

  /**
   * Reactivate child account
   * POST /children-business-users/children/:childId/reactivate
   * 
   * @description Reactivate a previously removed child account
   * @auth Business user
   */
  reactivateChild = CatchAsync(async (req: any, res: any) => {
    // ─────────────────────────────────────────────────────────────
    // Step 1: Get business user ID and child ID
    // ─────────────────────────────────────────────────────────────
    const businessUserId = (req as any).user.userId;
    const childUserId = req.params.childId;

    // ─────────────────────────────────────────────────────────────
    // Step 2: Reactivate child
    // ─────────────────────────────────────────────────────────────
    await this.service.reactivateChild(businessUserId, childUserId);

    // ─────────────────────────────────────────────────────────────
    // Step 3: Send success response
    // ─────────────────────────────────────────────────────────────
    new SuccessResponse(
      StatusCodes.OK,
      'Child account reactivated successfully',
      null
    ).send(res);
  });

  /**
   * Get children statistics
   * GET /children-business-users/statistics
   * 
   * @description Get statistics about children accounts
   * @auth Business user
   */
  getStatistics = CatchAsync(async (req: any, res: any) => {
    // ─────────────────────────────────────────────────────────────
    // Step 1: Get business user ID
    // ─────────────────────────────────────────────────────────────
    const businessUserId = (req as any).user.userId;

    // ─────────────────────────────────────────────────────────────
    // Step 2: Get counts for each status
    // ─────────────────────────────────────────────────────────────
    const [activeCount, inactiveCount, removedCount] = await Promise.all([
      this.service.getChildrenCount(businessUserId),
      this.service.model.countDocuments({
        parentBusinessUserId: businessUserId,
        status: CHILDREN_BUSINESS_USER_STATUS.INACTIVE,
        isDeleted: false,
      }),
      this.service.model.countDocuments({
        parentBusinessUserId: businessUserId,
        status: CHILDREN_BUSINESS_USER_STATUS.REMOVED,
        isDeleted: true,
      }),
    ]);

    // ─────────────────────────────────────────────────────────────
    // Step 3: Get subscription limit
    // ─────────────────────────────────────────────────────────────
    const { UserSubscription } = await import('../../subscription.module/userSubscription/userSubscription.model');
    const { SubscriptionPlan } = await import('../../subscription.module/subscriptionPlan/subscriptionPlan.model');

    const subscription = await UserSubscription.findOne({
      userId: businessUserId,
      status: 'active',
    }).populate('subscriptionPlanId', 'maxChildrenAccount subscriptionName');

    const maxChildren = subscription?.subscriptionPlanId ? 
      (subscription.subscriptionPlanId as any).maxChildrenAccount : 0;

    // ─────────────────────────────────────────────────────────────
    // Step 4: Send success response
    // ─────────────────────────────────────────────────────────────
    new SuccessResponse(
      StatusCodes.OK,
      'Statistics retrieved successfully',
      {
        active: activeCount,
        inactive: inactiveCount,
        removed: removedCount,
        total: activeCount + inactiveCount + removedCount,
        maxAllowed: maxChildren,
        remaining: maxChildren - activeCount,
      }
    ).send(res);
  });
}

export const childrenBusinessUserController = new ChildrenBusinessUserController();
