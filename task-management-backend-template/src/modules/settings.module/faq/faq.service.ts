import { StatusCodes } from 'http-status-codes';
import { Faq } from './faq.model';
import { IFaq } from './faq.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class FaqService extends GenericService<
  typeof Faq,
  IFaq
> {
  constructor() {
    super(Faq);
  }
}
