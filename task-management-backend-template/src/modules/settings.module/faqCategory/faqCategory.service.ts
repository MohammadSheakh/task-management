import { StatusCodes } from 'http-status-codes';
import { FaqCategory } from './faqCategory.model';
import { IFaqCategory } from './faqCategory.interface';
import { GenericService } from '../../_generic-module/generic.services';
import PaginationService from '../../../common/service/paginationService';
import { PaginateOptions } from '../../../types/paginate';


export class FaqCategoryService extends GenericService<
  typeof FaqCategory,
  IFaqCategory
> {
  constructor() {
    super(FaqCategory);
  }


  async getAllCategoriesWithFaqs(
    options: PaginateOptions
  ) {
    const pipeline = [
      // 1️⃣ Only active categories
      {
        $match: {
          isDeleted: false,
        },
      },

      // 2️⃣ Lookup FAQs for each category
      {
        $lookup: {
          from: 'faqs',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$faqCategoryId', '$$categoryId'],
                },
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                question: 1,
                answer: 1,
              },
            },
          ],
          as: 'faqs',
        },
      },

      // 3️⃣ Shape category response
      {
        $project: {
          _id: 1,
          categoryName: 1,
          faqs: 1,
        },
      },
    ];

    const result = await PaginationService.aggregationPaginate(
      FaqCategory,
      pipeline,
      options
    );

    return result;
  }


}
