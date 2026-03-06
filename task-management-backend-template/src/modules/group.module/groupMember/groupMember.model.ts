//@ts-ignore
import { model, Schema, Types, Document } from 'mongoose';
import { IGroupMember, IGroupMemberDocument, IGroupMemberModel } from './groupMember.interface';
import { GROUP_MEMBER_ROLES, GROUP_MEMBER_STATUS } from './groupMember.constant';
import paginate from '../../../common/plugins/paginate';

/**
 * GroupMember Schema
 * Represents a membership relationship between a user and a group
 *
 * Design Principles:
 * - Prevents duplicate memberships (unique index)
 * - Optimized for frequent member lookups
 * - Supports soft delete for audit trails
 * - Tracks join date for seniority-based features
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
const groupMemberSchema = new Schema<IGroupMemberDocument>(
  {
    // ─── References ────────────────────────────────────────────────────
    /**
     * Reference to the group
     * Cannot be changed after creation
     */
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
      immutable: true,
    },

    /**
     * Reference to the user
     * Cannot be changed after creation
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      immutable: true,
    },

    // ─── Role & Status ─────────────────────────────────────────────────
    /**
     * Member's role in the group
     * Determines permissions within the group
     */
    role: {
      type: String,
      enum: Object.values(GROUP_MEMBER_ROLES),
      required: [true, 'Member role is required'],
      default: GROUP_MEMBER_ROLES.MEMBER,
    },

    /**
     * Member's current status
     * Active members can participate in group activities
     */
    status: {
      type: String,
      enum: Object.values(GROUP_MEMBER_STATUS),
      required: [true, 'Member status is required'],
      default: GROUP_MEMBER_STATUS.ACTIVE,
    },

    // ─── Membership Details ────────────────────────────────────────────
    /**
     * When the member joined the group
     * Auto-set on creation
     */
    joinedAt: {
      type: Date,
      required: [true, 'Join date is required'],
      default: Date.now,
    },

    /**
     * Optional note or reason
     * Can be used for join requests or removal reasons
     */
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
    },

    /**
     * Custom metadata for extensibility
     * Store member-specific settings here
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // ─── System Fields ─────────────────────────────────────────────────
    /**
     * Soft delete flag
     * Never hard delete membership records
     */
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Exclude by default in queries
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for Performance ─────────────────────────────────────────
/**
 * Compound indexes optimized for common query patterns
 * Critical for 100K+ users scale
 */

// Primary query: Find all members of a group
groupMemberSchema.index({ groupId: 1, status: 1, isDeleted: 1 });

// Find all groups for a user
groupMemberSchema.index({ userId: 1, status: 1, isDeleted: 1 });

// Prevent duplicate memberships (unique compound index)
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Find members by role within a group
groupMemberSchema.index({ groupId: 1, role: 1, status: 1 });

// Find owners/admins quickly for permission checks
groupMemberSchema.index({ groupId: 1, role: 1, isDeleted: 1 });

// Analytics: Track member growth over time
groupMemberSchema.index({ joinedAt: -1, groupId: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────
/**
 * Virtual to get member's display name
 */
groupMemberSchema.virtual('displayName').get(function () {
  const doc = this as IGroupMemberDocument;
  return `Member_${doc._id.toString().slice(-6)}`;
});

/**
 * Virtual to check if member has elevated permissions
 */
groupMemberSchema.virtual('hasElevatedPermissions').get(function () {
  const doc = this as IGroupMemberDocument;
  return doc.role === GROUP_MEMBER_ROLES.OWNER || doc.role === GROUP_MEMBER_ROLES.ADMIN;
});

// ─── Instance Methods ────────────────────────────────────────────────
/**
 * Check if member has specific permission
 */
groupMemberSchema.methods.hasPermission = function (permission: string): boolean {
  const doc = this as IGroupMemberDocument;
  const permissions = {
    [GROUP_MEMBER_ROLES.OWNER]: {
      CAN_EDIT_GROUP: true,
      CAN_DELETE_GROUP: true,
      CAN_INVITE_MEMBERS: true,
      CAN_REMOVE_MEMBERS: true,
    },
    [GROUP_MEMBER_ROLES.ADMIN]: {
      CAN_EDIT_GROUP: true,
      CAN_DELETE_GROUP: false,
      CAN_INVITE_MEMBERS: true,
      CAN_REMOVE_MEMBERS: true,
    },
    [GROUP_MEMBER_ROLES.MEMBER]: {
      CAN_EDIT_GROUP: false,
      CAN_DELETE_GROUP: false,
      CAN_INVITE_MEMBERS: false,
      CAN_REMOVE_MEMBERS: false,
    },
  };

  return permissions[doc.role as keyof typeof permissions]?.[permission as any] || false;
};

// ─── Static Methods ──────────────────────────────────────────────────
/**
 * Check if user is already a member of the group
 */
groupMemberSchema.statics.isUserMember = async function (
  groupId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<boolean> {
  const member = await this.findOne({
    groupId,
    userId,
    status: GROUP_MEMBER_STATUS.ACTIVE,
    isDeleted: false,
  });
  return !!member;
};

/**
 * Get member count for a group
 */
groupMemberSchema.statics.getMemberCount = async function (
  groupId: Types.ObjectId
): Promise<number> {
  const count = await this.countDocuments({
    groupId,
    status: GROUP_MEMBER_STATUS.ACTIVE,
    isDeleted: false,
  });
  return count;
};

/**
 * Get all member IDs for a group
 */
groupMemberSchema.statics.getMemberIds = async function (
  groupId: Types.ObjectId
): Promise<Types.ObjectId[]> {
  const members = await this.find({
    groupId,
    status: GROUP_MEMBER_STATUS.ACTIVE,
    isDeleted: false,
  }).select('userId');

  return members.map(m => m.userId);
};

// ─── Plugins ─────────────────────────────────────────────────────────
/**
 * Pagination plugin
 */
groupMemberSchema.plugin(paginate);

// ─── Transform ───────────────────────────────────────────────────────
/**
 * Transform output for API responses
 */
groupMemberSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._groupMemberId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

groupMemberSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._groupMemberId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

// ─── Export Model ────────────────────────────────────────────────────
export const GroupMember = model<IGroupMemberDocument, IGroupMemberModel>(
  'GroupMember',
  groupMemberSchema
);
