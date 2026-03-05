//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { AdminCapsuleTopic } from './adminCapsuleTopic.model';
import { IAdminCapsuleTopic } from './adminCapsuleTopic.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class AdminCapsuleTopicService extends GenericService<
  typeof AdminCapsuleTopic,
  IAdminCapsuleTopic
> {
  constructor() {
    super(AdminCapsuleTopic);
  }
}
