//@ts-ignore
import { model, Schema, Types } from 'mongoose';
import { TProfileImage, IUser, UserModal } from './user.interface';
import paginate from '../../../common/plugins/paginate';
//@ts-ignore
import bcryptjs from 'bcryptjs';
import { config } from '../../../config';
import { TpreferredLanguage, TStatusType } from './user.constant';
import { Roles } from '../../../middlewares/roles';
import { TSubscription } from '../../../enums/subscription';
import { TAuthProvider } from '../../auth/auth.constants';

// Profile Image Schema
const profileImageSchema = new Schema<TProfileImage>({
  imageUrl: {
    type: String,
    required: [true, 'Image url is required'],
    default: '/uploads/users/user.png',
  },
});

// User Schema Definition
const userSchema = new Schema<IUser, UserModal>(
  {
    profileId: { //🔗 acceptTOC
      type: Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    role: {
      type: String,
      enum: {
        values: Roles,
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },

    // nullable for social login .. 
    password: {
      type: String,
      required: [false, 'Password is not required'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    profileImage: {
      type: profileImageSchema,
      required: false,
      default: { imageUrl: '/uploads/users/user.png' },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber : { // TODO : add proper validation
      type: String,
    },

    // 🔑 CALendly Integration Fields
    calendly: {
      userId: { 
        type: String, 
        unique: true,
        sparse: true,
        index: true 
      },

      // ✅ store full URIs — needed for all API calls
      userUri: String,
      organizationUri : String,

      // tokens
      encryptedAccessToken: String, // NEVER store raw tokens
      refreshToken : String,
      expiresAt : Date,

      // meta
      webhookSubscriptionId: String,
      profileUrl: String, // e.g., "https://calendly.com/mentor-john"
      connectedAt: Date,
      disconnectedAt: Date
    },
    
    //---------------------------------
    // Auth related
    //---------------------------------

    authProvider: {
      type: String,
      enum: [ TAuthProvider.local, TAuthProvider.google, TAuthProvider.apple],
      default: 'local',
    },

    lastPasswordChange: { type: Date },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: { type: Date }, // 🔴 not sure 

    
    //---------------------------------
    // Wallet Related Info
    //---------------------------------
    walletId : {
      type: Types.ObjectId,
      ref: 'Wallet',
      required: false, // user and admin dont need any wallet .. only provider need wallet 
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Apply the paginate plugin
userSchema.plugin(paginate);

// Static methods
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id);
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcryptjs.compare(password, hashPassword);
};

// FIX : ts issue 
// Middleware to hash password before saving
userSchema.pre('save', async function (next) {

  // INFO : while running seeder .. comment this out 
  // if (this.isModified('password')) {
  //   this.password = await bcryptjs.hash(
  //     this.password,
  //     Number(config.bcrypt.saltRounds),
  //   );
  // }
  next();
});


// Use transform to rename _id to _projectId
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userId = ret._id;  // Rename _id to _projectId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});

// ────────────────────────────────────────────────────────────────────────
// Indexes for Performance Optimization
// ────────────────────────────────────────────────────────────────────────

// Single field indexes
userSchema.index({ email: 1 }, { unique: true });  // Already exists from schema
userSchema.index({ role: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ isDeleted: 1 });

// Compound indexes for common query patterns
userSchema.index({ role: 1, isDeleted: 1 });  // Admin queries for active users by role
userSchema.index({ email: 1, isDeleted: 1 });  // Login with soft delete check
userSchema.index({ role: 1, isEmailVerified: 1, isDeleted: 1 });  // Filter by role, verification, and deletion
userSchema.index({ phoneNumber: 1, isDeleted: 1 });  // Phone lookup with soft delete
userSchema.index({ createdAt: -1, isDeleted: 1 });  // Recent users query
userSchema.index({ updatedAt: -1, isDeleted: 1 });  // Recently updated users

// Index for wallet queries
userSchema.index({ walletId: 1, isDeleted: 1 });

// Index for Calendly integration
userSchema.index({ 'calendly.userId': 1 }, { sparse: true });

// Text index for search (if needed in future)
// userSchema.index({ name: 'text', email: 'text' });

// Export the User model
export const User = model<IUser, UserModal>('User', userSchema);
