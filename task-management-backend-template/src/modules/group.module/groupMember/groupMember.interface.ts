import { Document, Types } from 'mongoose';

/**
 * Group Member Role
 * Defines the hierarchy within a group
 */
export type TGroupMemberRole = 'owner' | 'admin' | 'member';

/**
 * Group Member Status
 * Represents the current state of the membership
 */
export type TGroupMemberStatus = 'active' | 'inactive' | 'blocked';

/**
 * Group Member Permissions
 * Defines what actions a member can perform
 * @see Figma: permission-flow.png
 */
export interface IGroupMemberPermissions {
  /**
   * Can create tasks for the group
   * Default: false for Secondary users
   */
  canCreateTasks: boolean;

  /**
   * Can invite new members
   * Default: false
   */
  canInviteMembers: boolean;

  /**
   * Can remove other members
   * Default: false
   */
  canRemoveMembers: boolean;

  /**
   * User who granted these permissions
   */
  grantedBy?: Types.ObjectId;

  /**
   * When permissions were granted
   */
  grantedAt?: Date;
}

/**
 * Group Member Interface
 * Defines the structure of a GroupMember document
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export interface IGroupMember {
  /**
   * Reference to the group
   */
  groupId: Types.ObjectId;

  /**
   * Reference to the user
   */
  userId: Types.ObjectId;

  /**
   * Member's role in the group
   */
  role: TGroupMemberRole;

  /**
   * Member's current status
   */
  status: TGroupMemberStatus;

  /**
   * When the member joined the group
   */
  joinedAt: Date;

  /**
   * Optional note or reason for joining/leaving
   */
  note?: string;

  /**
   * Member permissions (task creation, invite, etc.)
   * @see Figma: permission-flow.png
   */
  permissions?: IGroupMemberPermissions;

  /**
   * Custom metadata for extensibility
   */
  metadata?: Record<string, any>;

  /**
   * Soft delete flag
   */
  isDeleted: boolean;
}

/**
 * Group Member Document Interface
 * Extends IGroupMember with Mongoose Document methods
 */
export interface IGroupMemberDocument extends IGroupMember, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Check if member has specific permission
   */
  hasPermission(permission: string): boolean;
}

/**
 * Group Member Model Interface
 * Extends Model with custom static methods
 */
export interface IGroupMemberModel extends Document {
  /**
   * Check if user is already a member of the group
   */
  isUserMember(groupId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean>;

  /**
   * Get member count for a group
   */
  getMemberCount(groupId: Types.ObjectId): Promise<number>;

  /**
   * Get all member IDs for a group
   */
  getMemberIds(groupId: Types.ObjectId): Promise<Types.ObjectId[]>;
}

/**
 * Group Member Query Options Interface
 * For typed pagination and filtering
 */
export interface IGroupMemberQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  populate?: Array<{ path: string; select?: string }>;
  select?: string;
}
