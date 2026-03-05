//@ts-ignore
import { model, Schema } from 'mongoose';
import { IUserProfile, IUserProfileModel } from './userProfile.interface';

const userProfileSchema = new Schema<IUserProfile>({
    
    acceptTOC:{ // for mentor and student
        type: Boolean,
        required: [false, 'acceptTOC is not required'],
    },

    userId: { //🔗 for back reference .. 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
});

// userProfileSchema.index({ locationV2: "2dsphere" });

export const UserProfile = model<IUserProfile, IUserProfileModel>('UserProfile', userProfileSchema);