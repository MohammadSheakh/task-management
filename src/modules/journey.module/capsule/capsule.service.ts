import { StatusCodes } from 'http-status-codes';
import { Capsule } from './capsule.model';
import { ICapsule } from './capsule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { PaginateOptions } from '../../../types/paginate';
import ApiError from '../../../errors/ApiError';
import PaginationService from '../../../common/service/paginationService';
//@ts-ignore
import mongoose from 'mongoose';

export class CapsuleService extends GenericService<
  typeof Capsule,
  ICapsule
> {
  constructor() {
    super(Capsule);
  }

  async getModulesAndQuestionsByCapsuleId (
      filters: any, 
      options: PaginateOptions) {
    

    const matchStage : any = {
      isDeleted : false,
      _id: new mongoose.Types.ObjectId(filters.capsuleId),
    }

    console.log("matchStage :: ", matchStage)

    const pipeline = [
      {
        $match : matchStage
      },
      // lookup capsules for each journey .. though we have just one journey
      {
        $lookup : {
          from : 'modules', // collectionName
          let : { capsuleId : '$_id'},
          pipeline : [
            {
              $match : {
                $expr : { $eq : ['$capsuleId', '$$capsuleId'] },
                isDeleted : false,
              }
            },

            // ✅ populate attachments INSIDE module
            {
              $lookup: {
                from: 'attachments',
                localField: 'attachments',
                foreignField: '_id',
                as: 'attachments',
              },
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

      // 2. Lookup front-side certificate attachments
      // {
      //   $lookup: {
      //     from: 'attachments',
      //     localField: 'capsuleModules.attachments',
      //     foreignField: '_id',
      //     as: 'attachments'
      //   }
      // },

      //--------------------------------------------------
      {
        $lookup : {
          from : 'journeyquestions', // collectionName
          let : { capsuleId : '$_id'},
          pipeline : [
            {
              $match : {
                $expr : { $eq : ['$capsuleId', '$$capsuleId'] },
                isDeleted : false,
              }
            },
            { // ------- project from capsule fields.. 
              $project: {
                _id: 1,
                questionText: 1,
                helpText: 1,
              },
            },
          ],
          as : 'capsuleQuestions',
        }
      },
      //--------------------------------------------------
      {
        $project: { // - from journey table .. 
          _id: 1,
          capsuleQuestions : 1,
          capsuleModules  :1,

        },
      },

    ]

    const res = await Capsule.aggregate(pipeline);

    // const result = await PaginationService.aggregationPaginate(
    //   Capsule,
    //   pipeline,
    //   options,
    // )

    return res;
    // return result;
  } 
}
