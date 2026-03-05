//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AdminCapsuleTopic } from './adminCapsuleTopic.model';
import { IAdminCapsuleTopic } from './adminCapsuleTopic.interface';
import { AdminCapsuleTopicService } from './adminCapsuleTopic.service';

export class AdminCapsuleTopicController extends GenericController<
  typeof AdminCapsuleTopic,
  IAdminCapsuleTopic
> {
  AdminCapsuleTopicService = new AdminCapsuleTopicService();

  constructor() {
    super(new AdminCapsuleTopicService(), 'AdminCapsuleTopic');
  }

  // add more methods here if needed or override the existing ones 
}
