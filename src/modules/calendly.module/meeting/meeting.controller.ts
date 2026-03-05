import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Meeting } from './meeting.model';
import { IMeeting } from './meeting.interface';
import { MeetingService } from './meeting.service';

export class MeetingController extends GenericController<
  typeof Meeting,
  IMeeting
> {
  MeetingService = new MeetingService();

  constructor() {
    super(new MeetingService(), 'Meeting');
  }

  // add more methods here if needed or override the existing ones 
}
