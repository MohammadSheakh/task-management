import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { StudentModuleTracker } from './studentModuleTracker.model';
import { IStudentModuleTracker } from './studentModuleTracker.interface';
import { StudentModuleTrackerService } from './studentModuleTracker.service';

export class StudentModuleTrackerController extends GenericController<
  typeof StudentModuleTracker,
  IStudentModuleTracker
> {
  StudentModuleTrackerService = new StudentModuleTrackerService();

  constructor() {
    super(new StudentModuleTrackerService(), 'StudentModuleTracker');
  }

  // add more methods here if needed or override the existing ones 
}
