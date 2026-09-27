import { Patterns } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEmployeeInput, EmployeeQuery, EmployeeService, UpdateEmployeeInput } from './employee.service';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern(Patterns.EMPLOYEE_CREATE)
  create(@Payload() data: CreateEmployeeInput) {
    return this.employeeService.create(data);
  }

  @MessagePattern(Patterns.EMPLOYEE_FIND_ALL)
  findAll(@Payload() query: EmployeeQuery) {
    return this.employeeService.findAll(query);
  }

  @MessagePattern(Patterns.EMPLOYEE_FIND_ONE)
  findOne(@Payload() data: { id: number }) {
    return this.employeeService.findOne(data.id);
  }

  @MessagePattern(Patterns.EMPLOYEE_UPDATE)
  update(@Payload() data: { id: number; dto: UpdateEmployeeInput }) {
    return this.employeeService.update(data.id, data.dto);
  }

  @MessagePattern(Patterns.EMPLOYEE_DELETE)
  remove(@Payload() data: { id: number }) {
    return this.employeeService.remove(data.id);
  }
}
