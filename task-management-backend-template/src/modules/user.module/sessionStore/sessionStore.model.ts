//@ts-ignore
import { model, Schema } from 'mongoose';
import { IUserRoleData, IUserRoleDataModel } from './sessionStore.interface';
import paginate from '../../../common/plugins/paginate';

// This enables logout-all-devices, revoke device, detect token theft.
const UserRoleDataSchema = new Schema<IUserRoleData>(
  {
    sessionId: {
        type: String,
    },
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    refreshTokenHash : { //🆕
        type : String,
        required : true,
    },
    expiresAt : { //🆕
      type : Date,
    },
    rotatedFrom : { // 🆕 Previous session Id
        type : String,
        required : true,
    },
    deviceId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    isRevoked : { //🆕
      type : Boolean,
    },
    revokedAt : { //🆕
      type : Date,
    },
    lastUsedAt : { //🆕
        type : Date,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

UserRoleDataSchema.plugin(paginate);

UserRoleDataSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
UserRoleDataSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userRoleDataId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const UserRoleData = model<
  IUserRoleData,
  IUserRoleDataModel
>('UserRoleData', UserRoleDataSchema);
