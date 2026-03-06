import { Document, Types } from 'mongoose';

/**
 * Group Invitation Status
 * Represents the current state of an invitation
 */
export type TGroupInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

/**
 * Group Invitation Interface
 * Defines the structure of a GroupInvitation document
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
export interface IGroupInvitation {
  /**
   * Reference to the group
   */
  groupId: Types.ObjectId;

  /**
   * Reference to the user who sent the invitation
   */
  invitedByUserId: Types.ObjectId;

  /**
   * Reference to the user being invited (if they have an account)
   * Optional - can invite by email alone
   */
  invitedUserId?: Types.ObjectId;

  /**
   * Email of the invited person
   * Used for non-registered users or lookup
   */
  email?: string;

  /**
   * Invitation status
   */
  status: TGroupInvitationStatus;

  /**
   * Unique token for invitation acceptance
   */
  token: string;

  /**
   * When the invitation expires
   */
  expiresAt: Date;

  /**
   * Optional personal message with invitation
   */
  message?: string;

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
 * Group Invitation Document Interface
 * Extends IGroupInvitation with Mongoose Document methods
 */
export interface IGroupInvitationDocument extends IGroupInvitation, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Check if invitation is still valid
   */
  isValid(): boolean;

  /**
   * Check if invitation has expired
   */
  isExpired(): boolean;
}

/**
 * Group Invitation Model Interface
 * Extends Model with custom static methods
 */
export interface IGroupInvitationModel extends Document {
  /**
   * Generate unique invitation token
   */
  generateToken(): string;

  /**
   * Find valid invitation by token
   */
  findByToken(token: string): Promise<IGroupInvitationDocument | null>;

  /**
   * Count pending invitations for a group
   */
  countPendingInvitations(groupId: Types.ObjectId): Promise<number>;

  /**
   * Expire old invitations
   */
  expireOldInvitations(): Promise<number>;
}

/**
 * Group Invitation Query Options Interface
 */
export interface IGroupInvitationQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  populate?: Array<{ path: string; select?: string }>;
  select?: string;
}

/**
 * Bulk Invitation Payload
 */
export interface IBulkInvitationPayload {
  emails: string[];
  userIds?: string[];
  message?: string;
}
