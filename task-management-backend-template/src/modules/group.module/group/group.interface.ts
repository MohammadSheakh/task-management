import { Document, Types } from 'mongoose';
import { GroupVisibility, GroupStatus } from './group.constant';

/**
 * Group Visibility Type
 * Derived from GroupVisibility enum
 */
export type TGroupVisibility = `${GroupVisibility}`;

/**
 * Group Status Type
 * Derived from GroupStatus enum
 */
export type TGroupStatus = `${GroupStatus}`;

/**
 * Group Interface
 * Defines the structure of a Group document
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export interface IGroup {
  /**
   * Group name
   * @maxLength 100
   */
  name: string;

  /**
   * Group description
   * @maxLength 1000
   */
  description?: string;

  /**
   * Owner of the group (creator)
   * References the User who created this group
   */
  ownerUserId: Types.ObjectId;

  /**
   * Group visibility setting
   * - private: Only members can see the group
   * - public: Anyone can see and request to join
   * - inviteOnly: Only invited users can join
   */
  visibility: TGroupVisibility;

  /**
   * Maximum number of members allowed
   * @default 100
   * @max 10000
   */
  maxMembers: number;

  /**
   * Current number of active members
   * Maintained automatically via aggregation
   */
  currentMemberCount: number;

  /**
   * Group avatar/profile image URL
   */
  avatarUrl?: string;

  /**
   * Group cover image URL
   */
  coverImageUrl?: string;

  /**
   * Group status
   */
  status: TGroupStatus;

  /**
   * Tags for categorization and search
   */
  tags?: string[];

  /**
   * Custom fields for extensibility
   */
  metadata?: Record<string, any>;

  /**
   * Soft delete flag
   */
  isDeleted: boolean;
}

/**
 * Group Document Interface
 * Extends IGroup with Mongoose Document methods
 */
export interface IGroupDocument extends IGroup, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Check if group is full
   */
  isFull(): boolean;

  /**
   * Check if group is accepting new members
   */
  isAcceptingMembers(): boolean;
}

/**
 * Group Model Interface
 * Extends Model with custom static methods
 */
export interface IGroupModel extends Document {
  /**
   * Count active groups for a user
   */
  countActiveGroupsForUser(userId: Types.ObjectId): Promise<number>;

  /**
   * Check if group name is unique (case-insensitive)
   */
  isNameUnique(name: string, excludeId?: Types.ObjectId): Promise<boolean>;
}

/**
 * Group Query Options Interface
 * For typed pagination and filtering
 */
export interface IGroupQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  populate?: Array<{ path: string; select?: string }>;
  select?: string;
}
