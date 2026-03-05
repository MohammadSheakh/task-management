import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { StudentMentor } from './studentMentor.model';
import { IStudentMentor } from './studentMentor.interface';
import { StudentMentorService } from './studentMentor.service';

export class StudentMentorController extends GenericController<
  typeof StudentMentor,
  IStudentMentor
> {
  StudentMentorService = new StudentMentorService();

  constructor() {
    super(new StudentMentorService(), 'StudentMentor');
  }

  // add more methods here if needed or override the existing ones 
}
