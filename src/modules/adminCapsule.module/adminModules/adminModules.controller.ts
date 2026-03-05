import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AdminModules } from './adminModules.model';
import { IAdminModules } from './adminModules.interface';
import { AdminModulesService } from './adminModules.service';

export class AdminModulesController extends GenericController<
  typeof AdminModules,
  IAdminModules
> {
  AdminModulesService = new AdminModulesService();

  constructor() {
    super(new AdminModulesService(), 'AdminModules');
  }

  // add more methods here if needed or override the existing ones 
}
