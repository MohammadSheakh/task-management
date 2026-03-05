import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Module } from './module.model';
import { IModule } from './module.interface';
import { ModuleService } from './module.service';

export class ModuleController extends GenericController<
  typeof Module,
  IModule
> {
  ModuleService = new ModuleService();

  constructor() {
    super(new ModuleService(), 'Module');
  }

  // add more methods here if needed or override the existing ones 
}
