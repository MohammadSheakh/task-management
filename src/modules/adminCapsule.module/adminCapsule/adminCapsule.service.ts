//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { AdminCapsule } from './adminCapsule.model';
import { IAdminCapsule, ICreateAdminCapsuleWithTopics } from './adminCapsule.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import mongoose from 'mongoose';
import { logger } from '../../../shared/logger';
import { IAdminCapsuleTopic } from '../adminCapsuleTopic/adminCapsuleTopic.interface';
import { AdminCapsuleTopic } from '../adminCapsuleTopic/adminCapsuleTopic.model';
import { TAdminCapsuleLevel } from './adminCapsule.constant';
import { PaginateOptions } from '../../../types/paginate';
import { AdminModules } from '../adminModules/adminModules.model';
import PaginationService from '../../../common/service/paginationService';
import ApiError from '../../../errors/ApiError';
import { AdminCapsuleReview } from '../../review.module/adminCapsuleReview/adminCapsuleReview.model';

export class AdminCapsuleService extends GenericService<
  typeof AdminCapsule,
  IAdminCapsule
> {
  constructor() {
    super(AdminCapsule);
  }

  async createV2(data:/*InterfaceType*/ Partial<ICreateAdminCapsuleWithTopics>, adminId :string) : Promise<any> {
    // console.log('req.body from generic create 🧪🧪', data);

    const session = await mongoose.startSession();
    session.startTransaction();
    let createdAdminCapsule: IAdminCapsule;

    try{
      // here we need to create capsule first .. 
      // then need to create capsules topic
      
      const adminCapsuleDTO : IAdminCapsule = {
        title : data.title as string,
        level : data.level as TAdminCapsuleLevel,
        description : data.description as string,
        totalModule : data.totalModule as number,
        price : data.price as number,
        attachments : data.attachments, // come from middleware  --- need to test 
        introductionVideo : data.introductionVideo, // come from middleware  
        adminId : adminId,
        capsuleCategoryId : data.capsuleCategoryId,
      }

      // createdAdminCapsule = await this.model.create(adminCapsuleDTO)


      createdAdminCapsule = await this.createWithSession(adminCapsuleDTO, session);


      if(data.whatYouLearn?.length > 0){
        // bulk insert for performance
        const topics: IAdminCapsuleTopic[] = data.whatYouLearn?.map((topic : string, idx) => ({
          adminCapsuleId : createdAdminCapsule._id,
          title : topic,
        }))

        const res = await AdminCapsuleTopic.insertMany(topics, { session });
      }
      
      await session.commitTransaction();

      return createdAdminCapsule;
      
    }catch(error){
      await session.abortTransaction();
      logger.error('Failed to create adminCapsule:', error);
      throw error;
    }finally{
      session.endSession();
    }

  }

  async getAllModulesByCapsuleId(
    options: PaginateOptions,
    capsuleId : string)
  {
    const capsule = await AdminCapsule.findOne(
      { _id: capsuleId, isDeleted: false },
      {
        title: 1,
        subTitle: 1,
        description: 1,
        price: 1,
        level: 1,
        estimatedTime: 1,
        totalModule: 1,
        attachments: 1,
        introductionVideo: 1,
      }
    )
    .populate([
      { path: 'attachments', select: 'attachment' },
      { path: 'introductionVideo', select: 'attachment' },
    ])
    .lean();

    if (!capsule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Capsule not found');
    }

    capsule.attachments = capsule.attachments.map((a: any) => a.attachment);
    capsule.introductionVideo = capsule.introductionVideo.map(
      (v: any) => v.attachment
    );


    const topics = await AdminCapsuleTopic.find(
      { adminCapsuleId: capsuleId, isDeleted: false },
      { title: 1 }
    )
    .sort({ createdAt: 1 })
    .lean();


    const modulePipeline = [
      {
        $match: {
          capsuleId: new mongoose.Types.ObjectId(capsuleId),
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
          title: 1,
          description: 1,
          estimatedTime: 1,
          numberOfLessons: 1,
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

    const modules = await PaginationService.aggregationPaginate(
      AdminModules,
      modulePipeline,
      options // page, limit, sort
    );

    return {
      capsule,
      topics,
      modules, // paginated result
    };
    
  }

  //🧱
  async getWithModulesAndReviews(capsuleId: string) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

    /* -----------------------------------------
      1️⃣ Get Capsule + Populate Attachments
    ------------------------------------------ */
    const capsule = await AdminCapsule.aggregate([
      {
        $match: { 
          _id: capsuleObjectId, 
          isDeleted: false 
        }
      },
      // Populate capsule attachments
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachments',
        },
      },
      // Populate introduction video
      {
        $lookup: {
          from: 'attachments',
          localField: 'introductionVideo',
          foreignField: '_id',
          as: 'introductionVideo',
        },
      },
      // Project capsule fields + flatten attachments
      {
        $project: {
          title: 1,
          subTitle: 1,
          description: 1,
          price: 1,
          level: 1,
          estimatedTime: 1,
          totalModule: 1,
          status: 1,
          thumbnail: 1,
          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: '$$att.attachment',
            },
          },
          introductionVideo: {
            $map: {
              input: '$introductionVideo',
              as: 'vid',
              in: '$$vid.attachment',
            },
          },
        },
      },
    ]);

    if (!capsule.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const capsuleData = capsule[0];

    /* -----------------------------------------
      2️⃣ Get Modules + Lessons + Attachments (Nested Aggregation)
    ------------------------------------------ */
    const modules = await AdminModules.aggregate([
      {
        $match: {
          capsuleId: capsuleObjectId,
          isDeleted: false,
        },
      },
      // Populate module attachments
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachments',
        },
      },
      // Lookup lessons for this module
      {
        $lookup: {
          from: 'lessons',
          let: { moduleId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$moduleId', '$$moduleId'] },
                    { $eq: ['$isDeleted', false] }
                  ]
                }
              }
            },
            // Populate lesson attachments
            {
              $lookup: {
                from: 'attachments',
                localField: 'attachments',
                foreignField: '_id',
                as: 'attachments',
              },
            },
            // Project lesson fields + flatten attachments
            {
              $project: {
                title: 1,
                description: 1,
                duration: 1,
                orderNumber: 1,
                videoUrl: 1,
                attachments: {
                  $map: {
                    input: '$attachments',
                    as: 'att',
                    in: '$$att.attachment',
                  },
                },
              },
            },
            { $sort: { orderNumber: 1 } }
          ],
          as: 'lessons',
        },
      },
      // Project module fields + flatten attachments
      {
        $project: {
          title: 1,
          description: 1,
          estimatedTime: 1,
          orderNumber: 1,
          numberOfLessons: 1,
          attachments: {
            $map: {
              input: '$attachments',
              as: 'att',
              in: '$$att.attachment',
            },
          },
          lessons: 1,
        },
      },
      { $sort: { orderNumber: 1 } }
    ]);

    /* -----------------------------------------
      3️⃣ Get Topics + Reviews (Parallel Queries)
    ------------------------------------------ */
    const [topics , reviews ] = await Promise.all([
      // Topics
      AdminCapsuleTopic.find(
        { adminCapsuleId: capsuleObjectId, isDeleted: false },
        { title: 1, description: 1, orderNumber: 1 }
      )
        .sort({ orderNumber: 1 })
        .lean(),
        
        // Reviews with user info
        AdminCapsuleReview.aggregate([
          {
            $match: {
              adminCapsuleId: capsuleObjectId,
              isDeleted: false,
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              rating: 1,
              review: 1,
              createdAt: 1,
              user: {
                _id: '$user._id',
                name: '$user.name',
                profileImage : '$user.profileImage',
              }
            }
          },
          { $sort: { createdAt: -1 } }
        ])
        
    ]);

    /* -----------------------------------------
      4️⃣ Assemble Final Response
    ------------------------------------------ */
    return {
      success: true,
      data: {
        capsule: capsuleData,
        modules,
        topics,
        
        reviews,
        
        stats: {
          totalModules: modules.length,
          totalLessons: modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0),
          totalTopics: topics.length,
          averageRating: reviews.length > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : null,
        }
        
      }
    };
  }

}
