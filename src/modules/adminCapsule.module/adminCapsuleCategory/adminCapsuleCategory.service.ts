import { StatusCodes } from 'http-status-codes';
import { AdminCapsuleCategory } from './adminCapsuleCategory.model';
import { IAdminCapsuleCategory } from './adminCapsuleCategory.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { PaginateOptions } from '../../../types/paginate';
import mongoose from 'mongoose';
import PaginationService from '../../../common/service/paginationService';
import { AdminCapsule } from '../adminCapsule/adminCapsule.model';
import ApiError from '../../../errors/ApiError';
import { MentorReview } from '../../review.module/mentorReview/mentorReview.model';

export class AdminCapsuleCategoryService extends GenericService<
  typeof AdminCapsuleCategory,
  IAdminCapsuleCategory
> {
  constructor() {
    super(AdminCapsuleCategory);
  }

  //--- 💎✨🔍 -> V2 Found
  async getAllCapsulesByCategoryId(
    options: PaginateOptions,
    capsuleCategoryId : string
  ) {
    const matchStage : any = {
      isDeleted : false,
      _id : new mongoose.Types.ObjectId(capsuleCategoryId),
    }

    const pipeline = [
      {
        $match : matchStage,
      }, 
      {
        $lookup : {
          from : 'attachments',
          localField  : 'attachments',
          foreignField : '_id',
          as : 'attachments',
        }
      },
      {
        $lookup : {
          from : 'admincapsules',
          let : { capsuleCategoryId : '$_id' },
          pipeline: [
            {
              $match : {
                $expr : { $eq : [ '$capsuleCategoryId' , '$$capsuleCategoryId'] },
                isDeleted : false,
              }
            }, 

            // populate attachments INSIDE capsule
            {
              $lookup : {
                from : 'attachments',
                localField  : 'attachments',
                foreignField : '_id',
                as : 'attachments',
              }
            },

            { // ------- project from capsule fields.. 
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                // attachments: 1, // need to populate this attachments .. 
                attachments: {
                  $map: { input: '$attachments', as: 'att', in: '$$att.attachment' }
                },
                estimatedTime : 1,
              },
            },
          ],
          as : 'capsuleModules',
        }
      },
      //--------------------------------------------

      {
        $project: { // - 
          _id: 1,
          capsuleModules  :1,
          title : 1,
          description : 1,
          attachments: {
            $map: { input: '$attachments', as: 'att', in: '$$att.attachment' }
          },
        },
      }
    ]


    const result = await PaginationService.aggregationPaginate(
      AdminCapsuleCategory,
      pipeline,
      options,
    )

    return result;
  }


  async getAllCapsulesByCategoryIdV2 (options: PaginateOptions,
    capsuleCategoryId : string) {

    const category = await AdminCapsuleCategory.findOne(
      { _id: capsuleCategoryId, isDeleted: false },
      { title: 1, description: 1, attachments: 1 }
    )
    .populate({
      path: 'attachments',
      select: 'attachment', // only what you need
    })
    .lean();

    if (!category) throw new ApiError(StatusCodes.BAD_REQUEST, 'Category not found');

    const pipeline = [
      {
        $match: {
          capsuleCategoryId: new mongoose.Types.ObjectId(capsuleCategoryId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachments',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          estimatedTime: 1,
          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: '$$att.attachment',
            },
          },
        },
      },
    ];

    const capsules = await PaginationService.aggregationPaginate(
      AdminCapsule,
      pipeline,
      options
    );

    return {
      category,
      capsules
    }
  } 


  async getAllCapsulesWithRatingInfoByCategoryIdV2WithCategoryInformation (options: PaginateOptions,
    capsuleCategoryId : string) {

    const category = await AdminCapsuleCategory.findOne(
      { _id: capsuleCategoryId, isDeleted: false },
      { title: 1, description: 1, attachments: 1 }
    )
    .populate({
      path: 'attachments',
      select: 'attachment', // only what you need
    })
    .lean();

    if (!category) throw new ApiError(StatusCodes.BAD_REQUEST, 'Category not found');

    const pipeline = [
      {
        $match: {
          capsuleCategoryId: new mongoose.Types.ObjectId(capsuleCategoryId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachments',
        },
      },

      //------------------------

      {
        $lookup: {
          from: 'admincapsulereviews',
          let: { capsuleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$adminCapsuleId', '$$capsuleId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: 'reviewStats',
        },
      },

      // flatten review result
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.avgRating', 0] }, 0],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.totalReviews', 0] }, 0],
          },
        },
      },

      //--------------------------
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          estimatedTime: 1,
          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: '$$att.attachment',
            },
          },

          //---
          
          avgRating: { $round: ['$avgRating', 1] },
          totalReviews: 1,
        },
      },
    ];

    const capsules = await PaginationService.aggregationPaginate(
      AdminCapsule,
      pipeline,
      options
    );

    return {
      category,
      capsules
    }
  } 

  async getAllCapsulesWithRatingInfoByCategoryIdV2 (options: PaginateOptions,
    capsuleCategoryId : string) {

    const category = await AdminCapsuleCategory.findOne(
      { _id: capsuleCategoryId, isDeleted: false },
      { title: 1, description: 1, attachments: 1 }
    )
    .populate({
      path: 'attachments',
      select: 'attachment', // only what you need
    })
    .lean();

    if (!category) throw new ApiError(StatusCodes.BAD_REQUEST, 'Category not found');

    const pipeline = [
      {
        $match: {
          capsuleCategoryId: new mongoose.Types.ObjectId(capsuleCategoryId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachments',
        },
      },

      //------------------------

      {
        $lookup: {
          from: 'admincapsulereviews',
          let: { capsuleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$adminCapsuleId', '$$capsuleId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: 'reviewStats',
        },
      },

      // flatten review result
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.avgRating', 0] }, 0],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.totalReviews', 0] }, 0],
          },
        },
      },

      //--------------------------
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          estimatedTime: 1,
          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: '$$att.attachment',
            },
          },

          //---
          
          avgRating: { $round: ['$avgRating', 1] },
          totalReviews: 1,
        },
      },
    ];

    const capsules = await PaginationService.aggregationPaginate(
      AdminCapsule,
      pipeline,
      options
    );

    return {
      capsules
    }
  } 


  


  async topThreeMentorReview() {
    const review = await MentorReview.find({
      rating : { $gt: 4 },
      isDeleted: false,
    }).limit(3);

    return review;
  }
}
