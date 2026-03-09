import { Types, Document, Model } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

/**
 * Children Business User Status
 * Represents the current state of the child account in the family
 */
export type TChildrenBusinessUserStatus = 'active' | 'inactive' | 'removed';

/**
 * Children Business User Interface
 * Defines the relationship between a business user (parent) and child account
 * 
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export interface IChildrenBusinessUser {
  /**
   * Reference to parent business user
   * The business user who created/owns this child account
   */
  parentBusinessUserId: Types.ObjectId;

  /**
   * Reference to child user
   * The child account created by the business user
   */
  childUserId: Types.ObjectId;

  /**
   * When the child was added to the family
   */
  addedAt: Date;

  /**
   * Who added this child
   * Usually the parent business user, could be self-registration with invitation code
   */
  addedBy: Types.ObjectId;

  /**
   * Child's status in the family
   * - active: Currently part of the family
   * - inactive: Temporarily deactivated
   * - removed: Removed from family
   */
  status: TChildrenBusinessUserStatus;

  /**
   * Optional note or reason (e.g., removal reason)
   */
  note?: string;

  /**
   * Soft delete flag
   */
  isDeleted: boolean;

  /**
   * Creation timestamp
   */
  createdAt?: Date;

  /**
   * Last update timestamp
   */
  updatedAt?: Date;
}

/**
 * Children Business User Document Interface
 * Extends IChildrenBusinessUser with Mongoose Document methods
 */
export interface IChildrenBusinessUserDocument extends IChildrenBusinessUser, Document {
  _id: Types.ObjectId;
  
  /**
   * Check if this child account is active
   */
  isActive(): boolean;
}

/**
 * Children Business User Model Interface
 * Extends Model with custom static methods
 */
export interface IChildrenBusinessUserModel extends Model<IChildrenBusinessUserDocument> {
  /**
   * Check if user is already a child of this business user
   */
  isChildOfBusinessUser(
    parentBusinessUserId: Types.ObjectId,
    childUserId: Types.ObjectId
  ): Promise<boolean>;

  /**
   * Get children count for a business user
   */
  getChildrenCount(parentBusinessUserId: Types.ObjectId): Promise<number>;

  /**
   * Get all active children for a business user
   */
  getActiveChildren(parentBusinessUserId: Types.ObjectId): Promise<Types.ObjectId[]>;
}

/**
 * Children Business User Query Options Interface
 * For typed pagination and filtering
 */
export interface IChildrenBusinessUserQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  populate?: Array<{ path: string; select?: string }>;
  select?: string;
  status?: TChildrenBusinessUserStatus;
}
