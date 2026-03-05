import { StatusCodes } from 'http-status-codes';
import { StudentModuleTracker } from './studentModuleTracker.model';
import { IStudentModuleTracker } from './studentModuleTracker.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class StudentModuleTrackerService extends GenericService<
  typeof StudentModuleTracker,
  IStudentModuleTracker
> {
  constructor() {
    super(StudentModuleTracker);
  }
}
