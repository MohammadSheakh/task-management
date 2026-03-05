import { StatusCodes } from 'http-status-codes';
import { Assessment } from './assessment.model';
import { IAssessment } from './assessment.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class AssessmentService extends GenericService<
  typeof Assessment,
  IAssessment
> {
  constructor() {
    super(Assessment);
  }

  async create(data: Partial<IAssessment>) : Promise<IAssessment> {
    
    const isFound = await Assessment.findOne({
      userId: data.userId
    })

    console.log("isFound :: ", isFound);

    if(isFound){
      return isFound;
    }else{
      const obj =  await this.model.create(data);
      console.log("obj :: ", obj);
      return obj;
    }
  }

}
