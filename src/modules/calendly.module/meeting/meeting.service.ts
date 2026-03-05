import { StatusCodes } from 'http-status-codes';
import { Meeting } from './meeting.model';
import { IMeeting } from './meeting.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class MeetingService extends GenericService<
  typeof Meeting,
  IMeeting
> {
  constructor() {
    super(Meeting);
  }
}
