/**
 * Group Module Constants
 * Centralized configuration for group-related limits and defaults
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */

/**
 * Group Visibility Options
 */
export const GROUP_VISIBILITY = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  INVITE_ONLY: 'inviteOnly',
} as const;

/**
 * Group Status Options
 */
export const GROUP_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
} as const;

/**
 * Group Member Roles
 * Defines hierarchy within a group
 */
export const GROUP_MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

/**
 * Group Member Status
 */
export const GROUP_MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

/**
 * Group Invitation Status
 */
export const GROUP_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

/**
 * Group Limits Configuration
 * Designed for scalability (100K users, 10M tasks)
 */
export const GROUP_LIMITS = {
  /**
   * Maximum groups a user can own
   * Prevents abuse and resource exhaustion
   */
  MAX_GROUPS_PER_USER: 50,

  /**
   * Maximum members in a single group
   * Can be overridden for enterprise groups
   */
  MAX_MEMBERS_PER_GROUP: 10000,

  /**
   * Default maximum members for new groups
   */
  DEFAULT_MAX_MEMBERS: 100,

  /**
   * Maximum pending invitations at a time
   */
  MAX_PENDING_INVITATIONS: 100,

  /**
   * Maximum tags per group
   */
  MAX_TAGS: 20,

  /**
   * Maximum tag length
   */
  MAX_TAG_LENGTH: 30,

  /**
   * Invitation expiry in days
   */
  INVITATION_EXPIRY_DAYS: 7,

  /**
   * Maximum name length
   */
  MAX_NAME_LENGTH: 100,

  /**
   * Maximum description length
   */
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;

/**
 * Cache Configuration for Redis
 * TTL values optimized for read-heavy workloads
 */
export const CACHE_CONFIG = {
  /**
   * Cache TTL for group data (seconds)
   */
  GROUP_TTL: 300, // 5 minutes

  /**
   * Cache TTL for group members list (seconds)
   */
  MEMBERS_TTL: 180, // 3 minutes

  /**
   * Cache TTL for group invitations (seconds)
   */
  INVITATIONS_TTL: 120, // 2 minutes

  /**
   * Cache TTL for user's groups list (seconds)
   */
  USER_GROUPS_TTL: 600, // 10 minutes

  /**
   * Cache TTL for member count (seconds)
   */
  MEMBER_COUNT_TTL: 60, // 1 minute
} as const;

/**
 * Rate Limiting Configuration
 * Prevents abuse and ensures fair usage
 */
export const RATE_LIMITS = {
  /**
   * Create group: 5 per minute
   * Prevents spam group creation
   */
  CREATE_GROUP: {
    windowMs: 60 * 1000,
    max: 5,
  },

  /**
   * Send invitations: 20 per minute
   * Allows bulk invites but prevents spam
   */
  SEND_INVITATION: {
    windowMs: 60 * 1000,
    max: 20,
  },

  /**
   * Join group requests: 10 per minute
   */
  JOIN_GROUP: {
    windowMs: 60 * 1000,
    max: 10,
  },

  /**
   * General group operations: 100 per minute
   */
  GENERAL: {
    windowMs: 60 * 1000,
    max: 100,
  },
} as const;

/**
 * Permission Matrix
 * Defines what each role can do
 */
export const PERMISSIONS = {
  OWNER: {
    CAN_EDIT_GROUP: true,
    CAN_DELETE_GROUP: true,
    CAN_INVITE_MEMBERS: true,
    CAN_REMOVE_MEMBERS: true,
    CAN_PROMOTE_MEMBERS: true,
    CAN_DEMOTE_MEMBERS: true,
    CAN_MANAGE_SETTINGS: true,
    CAN_VIEW_ANALYTICS: true,
  },
  ADMIN: {
    CAN_EDIT_GROUP: true,
    CAN_DELETE_GROUP: false,
    CAN_INVITE_MEMBERS: true,
    CAN_REMOVE_MEMBERS: true,
    CAN_PROMOTE_MEMBERS: false,
    CAN_DEMOTE_MEMBERS: false,
    CAN_MANAGE_SETTINGS: true,
    CAN_VIEW_ANALYTICS: true,
  },
  MEMBER: {
    CAN_EDIT_GROUP: false,
    CAN_DELETE_GROUP: false,
    CAN_INVITE_MEMBERS: false,
    CAN_REMOVE_MEMBERS: false,
    CAN_PROMOTE_MEMBERS: false,
    CAN_DEMOTE_MEMBERS: false,
    CAN_MANAGE_SETTINGS: false,
    CAN_VIEW_ANALYTICS: false,
  },
} as const;
