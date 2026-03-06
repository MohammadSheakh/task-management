//@ts-ignore
import { model, Schema, Types, Document } from 'mongoose';
import { IGroupInvitation, IGroupInvitationDocument, IGroupInvitationModel } from './groupInvitation.interface';
import { GROUP_INVITATION_STATUS, INVITATION_LIMITS } from './groupInvitation.constant';
import paginate from '../../../common/plugins/paginate';
import { randomBytes, createHash } from 'crypto';

/**
 * GroupInvitation Schema
 * Represents an invitation to join a group
 *
 * Design Principles:
 * - Supports both registered users and email-only invitations
 * - Token-based acceptance for security
 * - Automatic expiry handling
 * - BullMQ integration for async email sending
 * - Optimized for high-volume invitation workflows
 *
 * @version 1.0.0
 * @author Senior Engineering Team
 */
const groupInvitationSchema = new Schema<IGroupInvitationDocument>(
  {
    // ─── References ────────────────────────────────────────────────────
    /**
     * Reference to the group
     */
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },

    /**
     * Reference to the user who sent the invitation
     */
    invitedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter is required'],
    },

    /**
     * Reference to the user being invited
     * Optional - can invite by email alone
     */
    invitedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // ─── Contact Information ───────────────────────────────────────────
    /**
     * Email of the invited person
     * Used for non-registered users or lookup
     */
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    // ─── Status & Security ─────────────────────────────────────────────
    /**
     * Invitation status
     */
    status: {
      type: String,
      enum: Object.values(GROUP_INVITATION_STATUS),
      required: [true, 'Invitation status is required'],
      default: GROUP_INVITATION_STATUS.PENDING,
    },

    /**
     * Unique token for invitation acceptance
     * Used for email-based acceptance without login
     */
    token: {
      type: String,
      required: [true, 'Invitation token is required'],
      unique: true,
      index: true,
    },

    // ─── Expiry & Metadata ─────────────────────────────────────────────
    /**
     * When the invitation expires
     */
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },

    /**
     * Optional personal message
     */
    message: {
      type: String,
      trim: true,
      maxlength: [INVITATION_LIMITS.MAX_MESSAGE_LENGTH, `Message cannot exceed ${INVITATION_LIMITS.MAX_MESSAGE_LENGTH} characters`],
      default: '',
    },

    /**
     * Custom metadata for extensibility
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // ─── System Fields ─────────────────────────────────────────────────
    /**
     * Soft delete flag
     */
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for Performance ─────────────────────────────────────────
/**
 * Compound indexes optimized for invitation queries
 */

// Find pending invitations for a group
groupInvitationSchema.index({ groupId: 1, status: 1, isDeleted: 1 });

// Find invitations for a user
groupInvitationSchema.index({ invitedUserId: 1, status: 1, isDeleted: 1 });

// Find invitations by email
groupInvitationSchema.index({ email: 1, status: 1, isDeleted: 1 });

// Find expired invitations for cleanup
groupInvitationSchema.index({ expiresAt: 1, status: 1 });

// Composite index for invitation management
groupInvitationSchema.index({ invitedByUserId: 1, createdAt: -1, isDeleted: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────
/**
 * Virtual to check if invitation is still valid
 */
groupInvitationSchema.virtual('isValid').get(function () {
  const doc = this as IGroupInvitationDocument;
  return doc.status === GROUP_INVITATION_STATUS.PENDING && !doc.isExpired();
});

/**
 * Virtual to check if invitation has expired
 */
groupInvitationSchema.virtual('isExpired').get(function () {
  const doc = this as IGroupInvitationDocument;
  return new Date() > doc.expiresAt;
});

/**
 * Virtual to get days until expiry
 */
groupInvitationSchema.virtual('daysUntilExpiry').get(function () {
  const doc = this as IGroupInvitationDocument;
  const diff = doc.expiresAt.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ─── Instance Methods ────────────────────────────────────────────────
/**
 * Check if invitation is still valid
 */
groupInvitationSchema.methods.isValid = function (): boolean {
  return this.status === GROUP_INVITATION_STATUS.PENDING && !this.isExpired();
};

/**
 * Check if invitation has expired
 */
groupInvitationSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

// ─── Static Methods ──────────────────────────────────────────────────
/**
 * Generate unique invitation token
 */
groupInvitationSchema.statics.generateToken = function (): string {
  return randomBytes(INVITATION_LIMITS.TOKEN_LENGTH).toString('hex');
};

/**
 * Find valid invitation by token
 */
groupInvitationSchema.statics.findByToken = async function (
  token: string
): Promise<IGroupInvitationDocument | null> {
  const invitation = await this.findOne({
    token,
    status: GROUP_INVITATION_STATUS.PENDING,
    isDeleted: false,
  }).populate('groupId invitedByUserId invitedUserId');

  return invitation;
};

/**
 * Count pending invitations for a group
 */
groupInvitationSchema.statics.countPendingInvitations = async function (
  groupId: Types.ObjectId
): Promise<number> {
  const count = await this.countDocuments({
    groupId,
    status: GROUP_INVITATION_STATUS.PENDING,
    isDeleted: false,
  });
  return count;
};

/**
 * Expire old invitations
 * Run this as a cron job daily
 */
groupInvitationSchema.statics.expireOldInvitations = async function (): Promise<number> {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: GROUP_INVITATION_STATUS.PENDING,
      isDeleted: false,
    },
    {
      $set: { status: GROUP_INVITATION_STATUS.EXPIRED },
    }
  );

  return result.modifiedCount;
};

// ─── Pre-save Hook ───────────────────────────────────────────────────
/**
 * Generate token before saving if not provided
 */
groupInvitationSchema.pre('save', function (next) {
  const doc = this as IGroupInvitationDocument;

  if (!doc.token) {
    doc.token = (this.constructor as IGroupInvitationModel).generateToken();
  }

  if (!doc.expiresAt) {
    doc.expiresAt = new Date(Date.now() + INVITATION_LIMITS.INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);
  }

  next();
});

// ─── Plugins ─────────────────────────────────────────────────────────
/**
 * Pagination plugin
 */
groupInvitationSchema.plugin(paginate);

// ─── Transform ───────────────────────────────────────────────────────
/**
 * Transform output for API responses
 */
groupInvitationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._invitationId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    // Don't expose token in response
    delete ret.token;
    return ret;
  },
});

groupInvitationSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret._invitationId = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    delete ret.token;
    return ret;
  },
});

// ─── Export Model ────────────────────────────────────────────────────
export const GroupInvitation = model<IGroupInvitationDocument, IGroupInvitationModel>(
  'GroupInvitation',
  groupInvitationSchema
);
