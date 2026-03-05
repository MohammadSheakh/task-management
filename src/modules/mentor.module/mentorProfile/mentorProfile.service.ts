import { StatusCodes } from 'http-status-codes';
import { MentorProfile } from './mentorProfile.model';
import { IMentorProfile } from './mentorProfile.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { THaveAdminApproval } from './mentorProfile.constant';
import ApiError from '../../../errors/ApiError';
import { IUser } from '../../user.module/user/user.interface';
import { User } from '../../user.module/user/user.model';
import mongoose from 'mongoose';
import { MentorReview } from '../../review.module/mentorReview/mentorReview.model';

export class MentorProfileService extends GenericService<
  typeof MentorProfile,
  IMentorProfile
> {
  constructor() {
    super(MentorProfile);
  }

  // 💎✨🔍 -> V2 Found
  async updateMentorProfile (data : IMentorProfile & IUser, mentorId: string) {
    
    const existingMentorProfile: IMentorProfile = await MentorProfile.findOne({
      userId : mentorId,
    })

    if(data.name){
      const updatedUser : IUser = await User.findByIdAndUpdate(mentorId,{
        name : data.name
      });
    }

    if(
      data.location ||
      data.classType ||
      data.sessionPrice || 
      data.currentJobTitle || 
      data.companyName ||
      data.yearsOfExperience || 
      data.bio){
        
        // update mentor profile
        if(1 >= existingMentorProfile.profileInfoFillUpCount){
          data.profileInfoFillUpCount = 1;
        }

        await MentorProfile.findByIdAndUpdate(existingMentorProfile._id,{
          location : data.location,
          classType : data.classType,
          sessionPrice: data.sessionPrice, 
          currentJobTitle: data.currentJobTitle,  
          companyName: data.companyName ,
          yearsOfExperience: data.yearsOfExperience ,
          bio: data.bio,

          profileInfoFillUpCount : data.profileInfoFillUpCount || existingMentorProfile.profileInfoFillUpCount,
        })
    }

    //--------------- 2nd Stage

    if(data.careerStage || 
      data.focusArea || 
      data.industry ){

        console.log("2nd stage hit");
        
        // update mentor profile
        if(2 >= existingMentorProfile.profileInfoFillUpCount){
          data.profileInfoFillUpCount = 2;
        }

        await MentorProfile.findByIdAndUpdate(existingMentorProfile._id,{
          industry: data.industry, 
          focusArea: data.focusArea,  
          careerStage: data.careerStage, 

          profileInfoFillUpCount : data.profileInfoFillUpCount || existingMentorProfile.profileInfoFillUpCount,
        })
    }

    // ---------------- 3rd stage

    if(data.coreValues || 
      data.specialties ){

        console.log("3rd stage hit");
        
        // update mentor profile
        if(3 >= existingMentorProfile.profileInfoFillUpCount){
          data.profileInfoFillUpCount = 3;
        }

        await MentorProfile.findByIdAndUpdate(existingMentorProfile._id,{
          specialties: data.specialties, 
          coreValues: data.coreValues,

          profileInfoFillUpCount : data.profileInfoFillUpCount || existingMentorProfile.profileInfoFillUpCount,
        })
    }

    // ---------------- 4th stage

    if(data.coachingMethodologies){

        console.log("4th stage hit");
        
        // update mentor profile
        if(4 >= existingMentorProfile.profileInfoFillUpCount){
          data.profileInfoFillUpCount = 4;
        }

        await MentorProfile.findByIdAndUpdate(existingMentorProfile._id,{
          coachingMethodologies: data.coachingMethodologies,

          profileInfoFillUpCount : data.profileInfoFillUpCount || existingMentorProfile.profileInfoFillUpCount,
        })
    }


  } 

  async updateMentorProfileV2(data: IMentorProfile & IUser, mentorId: string) {

    const existing = await MentorProfile.findOne({ userId: mentorId });
    if (!existing) throw new Error('Mentor profile not found');

    const updateData: any = {};

    /* -----------------------------
      Update user name separately
    ------------------------------ */
    if (data.name) {
      await User.findByIdAndUpdate(mentorId, { name: data.name });
    }

    let newStage = existing.profileInfoFillUpCount || 0;

    /* -----------------------------
      Stage 1
    ------------------------------ */
    if (
      data.location ||
      data.classType ||
      data.sessionPrice ||
      data.currentJobTitle ||
      data.companyName ||
      data.yearsOfExperience ||
      data.bio
    ) {
      Object.assign(updateData, {
        location: data.location,
        classType: data.classType,
        sessionPrice: data.sessionPrice,
        currentJobTitle: data.currentJobTitle,
        companyName: data.companyName,
        yearsOfExperience: data.yearsOfExperience,
        bio: data.bio,
      });

      newStage = Math.max(newStage, 1);
    }

    /* -----------------------------
      Stage 2
    ------------------------------ */
    if (data.careerStage || data.focusArea || data.industry) {
      Object.assign(updateData, {
        industry: data.industry,
        focusArea: data.focusArea,
        careerStage: data.careerStage,
      });

      newStage = Math.max(newStage, 2);
    }

    /* -----------------------------
      Stage 3
    ------------------------------ */
    if (data.coreValues || data.specialties) {
      Object.assign(updateData, {
        specialties: data.specialties,
        coreValues: data.coreValues,
      });

      newStage = Math.max(newStage, 3);
    }

    /* -----------------------------
      Stage 4
    ------------------------------ */
    if (data.coachingMethodologies) {
      updateData.coachingMethodologies = data.coachingMethodologies;
      newStage = Math.max(newStage, 4);
    }

    /* -----------------------------
      Final Atomic Update
    ------------------------------ */
    await MentorProfile.findByIdAndUpdate(
      existing._id,
      {
        $set: updateData,
        $max: { profileInfoFillUpCount: newStage }, // 🔥 atomic safe
      }
    );

    return { message: 'Profile updated successfully' };
  }

  
  /*-─────────────────────────────────
  |  Mentor | request-for-admin-approval
  └──────────────────────────────────*/
  async changeStatusOfHaveAdminApproval(mentorId : string){
    const mentorProfileUpdate : IMentorProfile = MentorProfile.updateOne(
      {
        userId : mentorId,
      },{
        haveAdminApproval : THaveAdminApproval.inRequest,
        requestDate : new Date(),
      },{
        new : true
      }
    )

    if(!mentorProfileUpdate){
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor Profile Can not be updated.');
    }

    return mentorProfileUpdate;
  }

  /*-─────────────────────────────────
  |  Mentor | check status of mentor profiles haveAdminApproval
  └──────────────────────────────────*/
  async checkStatusOfHaveAdminApproval(mentorId : string){
    const statusOfMentorProfile : IMentorProfile = MentorProfile.findOne(
      {
        userId : mentorId,
      }
    ).select('haveAdminApproval isLive');

    if(!statusOfMentorProfile){
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor Profile Can not be updated.');
    }

    return statusOfMentorProfile;
  }


  /*-─────────────────────────────────
  |  🎲📊📈 // 💎✨🔍 -> V2 Found
  └──────────────────────────────────*/
  async mentorProfileInfoWithReviews(mentorUserId: string) {

    const user = await User.findById(mentorUserId).select('name profileImage');

  
    // 1️⃣ Get Mentor Profile + User Info
    const mentorProfile = await MentorProfile.find(
      {
      userId: user._id,
    }
  ).lean();

    if (!mentorProfile) {
      throw new Error("Mentor profile not found");
    }

    /*---------------------- --------------------*/

    // 2️⃣ Get Reviews + Reviewer Name
    const reviews = await MentorReview.find({
      mentorId: new mongoose.Types.ObjectId(mentorUserId),
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    // 3️⃣ Calculate Rating Stats (Mongo Aggregate)
    const ratingStats = await MentorReview.aggregate([
      {
        $match: {
          mentorId: new mongoose.Types.ObjectId(mentorUserId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$mentorId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const reviewStats = ratingStats[0]
      ? {
          averageRating: Number(ratingStats[0].averageRating.toFixed(1)),
          totalReviews: ratingStats[0].totalReviews,
        }
      : {
          averageRating: 0,
          totalReviews: 0,
        };


    //===========================================
    
    const reviewCountPerRating = await MentorReview.aggregate([
      {
        $match: {
          mentorId: new mongoose.Types.ObjectId(mentorUserId),
          isDeleted: false
        }
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);


    const fullResult = [1,2,3,4,5].map(rating => {
      const found = reviewCountPerRating.find(r => r._id === rating);
      return {
        rating,
        count: found ? found.count : 0,
        
      };
    });



    return {
      mentor: mentorProfile.userId,
      profile: mentorProfile,
      user : user,
      reviews: reviews.map((r) => ({
        reviewId: r._id,
        reviewerId: r.userId?._id,
        reviewerName: r.userId?.name,
        review: r.review,
        rating: r.rating,
        createdAt: r.createdAt,
      })),
      reviewStats,
      fullResult,
    };

  }

  /*-─────────────────────────────────
  |  🎲📊📈 
  └──────────────────────────────────*/
  async mentorProfileInfoWithReviewsV2(mentorUserId: string) {

    const mentorObjectId = new mongoose.Types.ObjectId(mentorUserId);

    // 1️⃣ User
    const user = await User.findById(mentorUserId)
      .select("name profileImage")
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    // 2️⃣ Mentor Profile
    const mentorProfile = await MentorProfile.findOne({
      userId: mentorUserId,
      isDeleted: false,
    }).lean();

    if (!mentorProfile) {
      throw new Error("Mentor profile not found");
    }

    // 3️⃣ Reviews
    const reviews = await MentorReview.find({
      mentorId: mentorObjectId,
      isDeleted: false,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    // 4️⃣ Single Aggregate for ALL rating stats
    const ratingAggregation = await MentorReview.aggregate([
      {
        $match: {
          mentorId: mentorObjectId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" }
        }
      }
    ]);

    let averageRating = 0;
    let totalReviews = 0;
    let ratingBreakdown = [];

    if (ratingAggregation.length) {
      averageRating = Number(ratingAggregation[0].averageRating.toFixed(1));
      totalReviews = ratingAggregation[0].totalReviews;

      const ratingArray = ratingAggregation[0].ratings;

      const countMap = {1:0,2:0,3:0,4:0,5:0};

      ratingArray.forEach((r: number) => {
        countMap[r]++;
      });

      ratingBreakdown = [5,4,3,2,1].map(rating => ({
        rating,
        count: countMap[rating],
        percentage: totalReviews
          ? Number(((countMap[rating] / totalReviews) * 100).toFixed(0))
          : 0
      }));
    } else {
      ratingBreakdown = [5,4,3,2,1].map(rating => ({
        rating,
        count: 0,
        percentage: 0
      }));
    }

    return {
      user,
      profile: mentorProfile,
      reviews: reviews.map(r => ({
        reviewId: r._id,
        reviewerId: r.userId?._id,
        reviewerName: r.userId?.name,
        review: r.review,
        rating: r.rating,
        createdAt: r.createdAt,
      })),
      reviewStats: {
        averageRating,
        totalReviews,
        ratingBreakdown
      }
    };
  }
}
