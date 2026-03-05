import { StatusCodes } from 'http-status-codes';
import { Journey } from './journey.model';
import { IJourney } from './journey.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { PaginateOptions } from '../../../types/paginate';
import PaginationService from '../../../common/service/paginationService';
import { PurchasedJourney } from '../purchasedJourney/purchasedJourney.model';
import { StudentCapsuleTracker } from '../studentCapsuleTracker/studentCapsuleTracker.model';
import { IStudentCapsuleTracker } from '../studentCapsuleTracker/studentCapsuleTracker.interface';
import { CapsuleService } from '../capsule/capsule.service';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';

const capsuleService = new CapsuleService();

export class JourneyService extends GenericService<
  typeof Journey,
  IJourney
> {
  constructor() {
    super(Journey);
  }

  async getJourneyDetailsWithCapsules (
      options: PaginateOptions) {
    const jouneyExist = await Journey.findOne({ isDeleted: false });

    if(!jouneyExist){
      throw new ApiError(StatusCodes.BAD_REQUEST, "Jounery not found.");
    }

    const matchStage : any = {
      isDeleted : false,
      
    }

    const pipeline = [
      {
        $match : matchStage
      },
      // lookup capsules for each journey .. though we have just one journey
      {
        $lookup : {
          from : 'capsules', // collectionName
          let : { journeyId : '$_id'},
          pipeline : [
            {
              $match : {
                $expr : { $eq : ['$journeyId', '$$journeyId'] },
                isDeleted : false,
              }
            },
            { // ------- project from capsule fields.. 
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                capsuleNumber: 1,
              },
            },
          ],
          as : 'journeyCapsules',
        }
      },
      {
        $project: { // - from journey table .. 
          _id: 1,
          title: 1,
          brief: 1,
          price: 1,
          journeyCapsules : 1,
        },
      },

    ]

    const result = await PaginationService.aggregationPaginate(
      Journey,
      pipeline,
      options,
    )

    return result;
  } 


  async isPurchasedByStudent(userId: string,
    filters: Partial<IJourney> , // Partial<INotification> // FixMe : fix type
    options: PaginateOptions,
    populateOptions?: any,
    select ? : string | string[]
  ){

    // check journey exist or not
    const isJourneyExist : IJourney = await Journey.findOne({
      isDeleted : false,
    });

    if(!isJourneyExist){
      throw new ApiError(StatusCodes.NOT_FOUND, 'Journey is not exist');
    }

    /*---------------------- --------------------*/

    

    // check this user purchased any journey or not
    const isPurchased = await PurchasedJourney.findOne({
      journeyId : isJourneyExist._id,
      studentId : userId,
      paymentStatus : TPaymentStatus.completed,
    })

    let result;

    if(!isPurchased){
      // return all capsule by journeyId .. with journeyId ..
      // so that student can purchase
      filters.journeyId = isJourneyExist._id;

      populateOptions = [];
      
      select = 'capsuleNumber title roadMapBrief'; 

      result = await capsuleService.getAllWithPagination(filters,options,populateOptions, select)
    }else{
      // return capsules with history

      // result = StudentCapsuleTracker.find({
      //   studentId: userId
      // })
      filters.studentId = userId;
    

      result = await StudentCapsuleTracker.paginate(
        filters, options, populateOptions, select
      )
    }

    return {
      result,
      journeyId : isJourneyExist._id,
      isPurchased : !!isPurchased,
    };

  }
}
