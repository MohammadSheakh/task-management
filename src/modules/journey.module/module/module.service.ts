import { StatusCodes } from 'http-status-codes';
import { Module } from './module.model';
import { IModule } from './module.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class ModuleService extends GenericService<
  typeof Module,
  IModule
> {
  constructor() {
    super(Module);
  }
}
