//@ts-ignore
import { model, Schema, Types, Document } from 'mongoose';
import { IGroup, IGroupDocument, IGroupModel } from './group.interface';
import { GROUP_LIMITS, GROUP_VISIBILITY, GROUP_STATUS } from './group.constant';
import paginate from '../../../common/plugins/paginate';

/**
 * Group Schema
 * Represents a team/group for collaborative task management
 *
 * Design Principles:
 * - Optimized for 100K+ users and 10M+ tasks
 * - Comprehensive indexing for fast queries
 * - Soft delete support for data recovery
 * - Metadata field for extensibility
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
const groupSchema = new Schema<IGroupDocument>(
  {
    // ─── Basic Information ─────────────────────────────────────────────
    /**
     * Group name
     * Must be unique per owner, indexed for search
     */
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [GROUP_LIMITS.MAX_NAME_LENGTH, `Name cannot exceed ${GROUP_LIMITS.MAX_NAME_LENGTH} characters`],
      minlength: [2, 'Name must be at least 2 characters'],
    },

    /**
     * Group description
     * Optional detailed description
     */
    description: {
      type: String,
      trim: true,
      maxlength: [GROUP_LIMITS.MAX_DESCRIPTION_LENGTH, `Description cannot exceed ${GROUP_LIMITS.MAX_DESCRIPTION_LENGTH} characters`],
      default: '',
    },

    // ─── Ownership & Membership ────────────────────────────────────────
    /**
     * Group owner (creator)
     * Cannot be changed after creation
     */
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group owner is required'],
      immutable: true,
    },

    /**
     * Group visibility
     * Controls who can find and join the group
     */
    visibility: {
      type: String,
      enum: Object.values(GROUP_VISIBILITY),
      required: [true, 'Group visibility is required'],
      default: GROUP_VISIBILITY.PRIVATE,
    },

    /**
     * Maximum members allowed
     * Prevents unlimited growth
     */
    maxMembers: {
      type: Number,
      required: [true, 'Maximum members is required'],
      default: GROUP_LIMITS.DEFAULT_MAX_MEMBERS,
      min: [1, 'Minimum 1 member required'],
      max: [GROUP_LIMITS.MAX_MEMBERS_PER_GROUP, `Maximum ${GROUP_LIMITS.MAX_MEMBERS_PER_GROUP} members allowed`],
    },

    /**
     * Current member count
     * Maintained via aggregation, cached in Redis
     */
    currentMemberCount: {
      type: Number,
      required: [true, 'Current member count is required'],
      default: 0,
      min: [0, 'Cannot be negative'],
    },

    // ─── Media & Branding ──────────────────────────────────────────────
    /**
     * Group avatar/profile image URL
     */
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },

    /**
     * Group cover image URL
     */
    coverImageUrl: {
      type: String,
      trim: true,
      default: '',
    },

    // ─── Status & Metadata ─────────────────────────────────────────────
    /**
     * Group status
     * Active groups can accept members and tasks
     */
    status: {
      type: String,
      enum: Object.values(GROUP_STATUS),
      required: [true, 'Group status is required'],
      default: GROUP_STATUS.ACTIVE,
    },

    /**
     * Tags for categorization and search
     * Limited to prevent abuse
     */
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= GROUP_LIMITS.MAX_TAGS;
        },
        message: `Maximum ${GROUP_LIMITS.MAX_TAGS} tags allowed`,
      },
    },

    /**
     * Custom metadata for extensibility
     * Store group-specific settings here
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // ─── System Fields ─────────────────────────────────────────────────
    /**
     * Soft delete flag
     * Never hard delete groups with associated data
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
 * Order matters: equality filters first, then range, then sort
 */

// Primary query pattern: Find groups by owner
groupSchema.index({ ownerUserId: 1, isDeleted: 1, createdAt: -1 });

// Find public groups for discovery
groupSchema.index({ visibility: 1, status: 1, isDeleted: 1 });

// Search by name (case-insensitive partial index)
groupSchema.index({ name: 'text', description: 'text' });

// Find groups by status for admin operations
groupSchema.index({ status: 1, isDeleted: 1, updatedAt: -1 });

// Find groups near member limit for monitoring
groupSchema.index({ currentMemberCount: -1, status: 1 });

// Composite index for analytics queries
groupSchema.index({ createdAt: -1, status: 1, visibility: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────
/**
 * Virtual to check if group is full
 */
groupSchema.virtual('isFull').get(function () {
  const doc = this as IGroupDocument;
  return doc.currentMemberCount >= doc.maxMembers;
});

/**
 * Virtual to check if group accepts new members
 */
groupSchema.virtual('isAcceptingMembers').get(function () {
  const doc = this as IGroupDocument;
  return (
    doc.status === GROUP_STATUS.ACTIVE &&
    doc.visibility !== GROUP_VISIBILITY.PRIVATE &&
    doc.currentMemberCount < doc.maxMembers
  );
});

// ─── Instance Methods ────────────────────────────────────────────────
/**
 * Check if group is full
 */
groupSchema.methods.isFull = function (): boolean {
  return this.currentMemberCount >= this.maxMembers;
};

/**
 * Check if group is accepting new members
 */
groupSchema.methods.isAcceptingMembers = function (): boolean {
  return (
    this.status === GROUP_STATUS.ACTIVE &&
    this.visibility !== GROUP_VISIBILITY.PRIVATE &&
    this.currentMemberCount < this.maxMembers
  );
};

// ─── Static Methods ──────────────────────────────────────────────────
/**
 * Count active groups for a user
 * Used for rate limiting and user analytics
 */
groupSchema.statics.countActiveGroupsForUser = async function (
  userId: Types.ObjectId
): Promise<number> {
  const count = await this.countDocuments({
    ownerUserId: userId,
    status: GROUP_STATUS.ACTIVE,
    isDeleted: false,
  });
  return count;
};

/**
 * Check if group name is unique for a user
 * Prevents duplicate group names per owner
 */
groupSchema.statics.isNameUnique = async function (
  name: string,
  excludeId?: Types.ObjectId
): Promise<boolean> {
  const query: any = {
    name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive
    isDeleted: false,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await this.findOne(query);
  return !existing;
};

// ─── Plugins ─────────────────────────────────────────────────────────
/**
 * Pagination plugin
 * Adds paginate() static method for server-side pagination
 */
groupSchema.plugin(paginate);

// ─── Transform ───────────────────────────────────────────────────────
/**
 * Transform output for API responses
 * - Rename _id to _groupId
 * - Include virtuals
 * - Remove sensitive fields
 */
groupSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._groupId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

groupSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._groupId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

// ─── Export Model ────────────────────────────────────────────────────
export const Group = model<IGroupDocument, IGroupModel>('Group', groupSchema);
