//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMentorProfile, IMentorProfileModel } from './mentorProfile.interface';
import paginate from '../../../common/plugins/paginate';
import { THaveAdminApproval, TMentorClass } from './mentorProfile.constant';

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    
    title: { // --------------------------- dont find this title
      type: String,
      required: [false, 'title is not required'],
    },

    topics: { // --------------------------- dont find this topics
      type: [String],
      required: [false, 'topics is not required'],
    },

    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },

    //❌ tasmia apu remove the category
    // mentorCategoryId: { //🔗
    //   type: Schema.Types.ObjectId,
    //   ref: 'MentorCategory',
    //   required: [true, 'mentorCategoryId is required'],
    // },
    
    language: {
      type: [String],
      required: [false, 'language is not required'],
    },

    //-------------------  1 Start

    location: {
      type: String,
      required: [false, 'location is not required'],
    },

    classType: {
      type: String,
      enum: [
        TMentorClass.online,
        TMentorClass.inPerson,
        TMentorClass.both,
      ],
      required: [
        false,
        `classType is not required it can be ${Object.values(TMentorClass).join(', ')}`,
      ],
    },
    
    
    sessionPrice: {
      type: Number,
      required: [false, 'sessionPrice is not required'],
      // min: [0, 'sessionPrice cannot be negative'],
    },
    currentJobTitle: {
      type: String,
      required: [false, 'currentJobTitle is not required'],
    },
    companyName: {
      type: String,
      required: [false, 'companyName is not required'],
    },
    yearsOfExperience: {
      type: Number,
      required: [false, 'yearsOfExperience is not required'],
      min: [0, 'yearsOfExperience cannot be negative'],
    },

    bio: {
      type: String,
      required: [false, 'bio is not required'],
    },

    //----------------- 1 END

    //----------------- 2 Start

    careerStage: {
      type: [String],
      required: [false, 'careerStage is not required'],
    },
    focusArea: {
      type: [String],
      required: [false, 'focusArea is not required'],
    },
    industry: {
      type: String,
      required: [false, 'industry is not required'],
    },

    //----------------- 2 End

    //----------------- 3 Start


    coreValues: {
      type: [String],
      required: [false, 'coreValues is not required'],
    },
    specialties: {
      type: [String],
      required: [false, 'specialties is not required'],
    },

     //----------------- 3 End

     //----------------- 4 Start

    coachingMethodologies: {
      type: [String],
      required: [false, 'coachingMethodologies is not required'],
    },

    
    calendlyProfileLink: {
      type: String,
      required: [false, 'calendlyProfileLink is not required'],
    },

    //----------------- 4 End

    /**
     * 
     * backend e data save korar shomoy
     * dekhte hobe ..
     * ei ei question er answer 
     * send korle ..
     * 
     * profileInfoFillUpCount
     * 
     * ei ta hobe .. 
     * 
     * every time profileInfoFillUpCount
     * set korar shomoy ..
     * 
     * new value >= previous value hoite
     * hobe 
     * 
     */
    profileInfoFillUpCount: {
      type: Number,
      required: [false, 'profileInfoFillUpCount is not required'],
      min: [0, 'profileInfoFillUpCount cannot be negative'],
    },

    // may be we dont need this 
    rating: {
      type: Number,
      required: [false, 'rating is not required'],
      min: [0, 'rating cannot be less than 0'],
      max: [5, 'rating cannot exceed 5'],
    },

    // 🆕 new logic .. 
    haveAdminApproval: {
      type: String,
      enum: [
        THaveAdminApproval.none,
        THaveAdminApproval.inRequest,
        THaveAdminApproval.approved,
        THaveAdminApproval.rejected,
      ],
      required: [
        false,
        `haveAdminApproval is not required it can be ${Object.values(THaveAdminApproval).join(', ')}`,
      ],
      default : THaveAdminApproval.none
    },

    requestDate : { //🆕
      type : Date,
      required : [false, "requestDate is not required."],
    },

    // 🆕 
    isLive: {
      type: Boolean,
      required: [false, 'isLive is not required'],
      default: false,
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

MentorProfileSchema.plugin(paginate);

// Use transform to rename _id to _projectId
MentorProfileSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._MentorProfileId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const MentorProfile = model<
  IMentorProfile,
  IMentorProfileModel
>('MentorProfile', MentorProfileSchema);
