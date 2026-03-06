/**
 * GroupInvitation Module Constants
 * Centralized configuration for group invitation-related limits and defaults
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */

/**
 * Group Invitation Status Options
 */
export const GROUP_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

/**
 * Group Invitation Limits Configuration
 */
export const INVITATION_LIMITS = {
  /**
   * Maximum pending invitations per group at a time
   */
  MAX_PENDING_INVITATIONS_PER_GROUP: 100,

  /**
   * Maximum invitations a user can send per day
   */
  MAX_INVITATIONS_PER_USER_PER_DAY: 50,

  /**
   * Maximum bulk invitations at once
   */
  MAX_BULK_INVITATIONS: 20,

  /**
   * Invitation expiry in days
   */
  INVITATION_EXPIRY_DAYS: 7,

  /**
   * Invitation expiry in hours (for calculation)
   */
  INVITATION_EXPIRY_HOURS: 7 * 24,

  /**
   * Maximum message length
   */
  MAX_MESSAGE_LENGTH: 500,

  /**
   * Token length in bytes
   */
  TOKEN_LENGTH: 32,
} as const;

/**
 * Cache Configuration for Redis
 */
export const INVITATION_CACHE_CONFIG = {
  /**
   * Cache TTL for pending invitations list (seconds)
   */
  PENDING_INVITATIONS_TTL: 120, // 2 minutes

  /**
   * Cache TTL for single invitation (seconds)
   */
  INVITATION_TTL: 300, // 5 minutes

  /**
   * Cache key prefix
   */
  PREFIX: 'groupInvitation',
} as const;

/**
 * Invitation Email Templates
 */
export const EMAIL_TEMPLATES = {
  /**
   * Template name for invitation email
   */
  INVITATION_TEMPLATE: 'group-invitation',

  /**
   * Subject line for invitation email
   */
  SUBJECT_TEMPLATE: 'You\'ve been invited to join {groupName}',

  /**
   * Email priority
   */
  PRIORITY: 'normal',
} as const;

/**
 * BullMQ Queue Configuration
 */
export const QUEUE_CONFIG = {
  /**
   * Queue name for processing invitations
   */
  INVITATION_QUEUE_NAME: 'group-invitations-queue',

  /**
   * Queue name for sending notification emails
   */
  NOTIFICATION_QUEUE_NAME: 'group-notification-queue',

  /**
   * Job attempts before failure
   */
  JOB_ATTEMPTS: 3,

  /**
   * Backoff delay in milliseconds
   */
  BACKOFF_DELAY: 5000,
} as const;

/**
 * Invitation Permissions
 * Who can send invitations
 */
export const INVITATION_PERMISSIONS = {
  /**
   * Roles that can send invitations
   */
  CAN_SEND_INVITATION: ['owner', 'admin'],

  /**
   * Roles that can cancel invitations
   */
  CAN_CANCEL_INVITATION: ['owner', 'admin', 'invitedBy'],

  /**
   * Roles that can accept/decline
   */
  CAN_RESPOND_TO_INVITATION: ['invitedUser'],
} as const;
