import { Types, Document, Model } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

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
  parentBusinessUserId: Types.ObjectId;
  childUserId: Types.ObjectId;
  addedAt: Date;
  addedBy: Types.ObjectId;
  status: TChildrenBusinessUserStatus;
  note?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Children Business User Document Interface
 * Extends IChildrenBusinessUser with Mongoose Document methods
 */
export interface IChildrenBusinessUserDocument extends IChildrenBusinessUser, Document {
  _id: Types.ObjectId;

  isActive(): boolean;
}

/**
 * Children Business User Model Interface
 * Extends Model with custom static methods
 */
export interface IChildrenBusinessUserModel extends Model<IChildrenBusinessUserDocument> {
  isChildOfBusinessUser(
    parentBusinessUserId: Types.ObjectId,
    childUserId: Types.ObjectId
  ): Promise<boolean>;

  getChildrenCount(parentBusinessUserId: Types.ObjectId): Promise<number>;

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
