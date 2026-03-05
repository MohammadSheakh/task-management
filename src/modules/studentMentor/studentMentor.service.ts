import { StatusCodes } from 'http-status-codes';
import { StudentMentor } from './studentMentor.model';
import { IStudentMentor } from './studentMentor.interface';
import { GenericService } from '../_generic-module/generic.services';


export class StudentMentorService extends GenericService<
  typeof StudentMentor,
  IStudentMentor
> {
  constructor() {
    super(StudentMentor);
  }
}
