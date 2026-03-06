/**
 * GroupMember Module Constants
 * Centralized configuration for group member-related limits and defaults
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */

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
 * Group Member Status Options
 */
export const GROUP_MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

/**
 * Group Member Limits Configuration
 */
export const GROUP_MEMBER_LIMITS = {
  /**
   * Maximum role hierarchy level
   * owner: 3, admin: 2, member: 1
   */
  ROLE_HIERARCHY: {
    owner: 3,
    admin: 2,
    member: 1,
  },

  /**
   * Minimum members required before group can be deleted
   */
  MIN_MEMBERS_FOR_GROUP: 1,

  /**
   * Maximum members that can be removed at once (bulk operations)
   */
  MAX_BULK_REMOVAL: 100,

  /**
   * Maximum note length
   */
  MAX_NOTE_LENGTH: 500,
} as const;

/**
 * Cache Configuration for Redis
 */
export const MEMBER_CACHE_CONFIG = {
  /**
   * Cache TTL for member list (seconds)
   */
  MEMBER_LIST_TTL: 180, // 3 minutes

  /**
   * Cache TTL for single member data (seconds)
   */
  MEMBER_TTL: 300, // 5 minutes

  /**
   * Cache key prefix
   */
  PREFIX: 'groupMember',
} as const;

/**
 * Permission Matrix
 * Defines what each role can do within a group
 */
export const MEMBER_PERMISSIONS = {
  OWNER: {
    CAN_EDIT_GROUP: true,
    CAN_DELETE_GROUP: true,
    CAN_INVITE_MEMBERS: true,
    CAN_REMOVE_MEMBERS: true,
    CAN_PROMOTE_MEMBERS: true,
    CAN_DEMOTE_MEMBERS: true,
    CAN_MANAGE_SETTINGS: true,
    CAN_VIEW_ANALYTICS: true,
    CAN_MANAGE_TASKS: true,
    CAN_DELETE_TASKS: true,
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
    CAN_MANAGE_TASKS: true,
    CAN_DELETE_TASKS: false,
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
    CAN_MANAGE_TASKS: true,
    CAN_DELETE_TASKS: false,
  },
} as const;

/**
 * Role Transition Rules
 * Defines which roles can promote/demote to which other roles
 */
export const ROLE_TRANSITIONS = {
  /**
   * Owner can promote member to admin
   */
  CAN_PROMOTE_TO_ADMIN: ['owner'],

  /**
   * Owner can demote admin to member
   */
  CAN_DEMOTE_FROM_ADMIN: ['owner'],

  /**
   * Owner and Admin can invite members
   */
  CAN_INVITE: ['owner', 'admin'],

  /**
   * Owner and Admin can remove members (not owners)
   */
  CAN_REMOVE_MEMBERS: ['owner', 'admin'],
} as const;
