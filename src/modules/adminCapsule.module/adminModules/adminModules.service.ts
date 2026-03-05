import { StatusCodes } from 'http-status-codes';
import { AdminModules } from './adminModules.model';
import { IAdminModules } from './adminModules.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class AdminModulesService extends GenericService<
  typeof AdminModules,
  IAdminModules
> {
  constructor() {
    super(AdminModules);
  }
}
