import { EMPLOYEE_SERVICE, Patterns, Role } from '@app/common';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators';
import { sendRpc } from '../common/send-rpc';
import { CreateEmployeeDto, PaginationQueryDto, UpdateEmployeeDto } from './employee.dto';

@ApiTags('Employees (Admin HRD)')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('employees')
export class EmployeeController {
  constructor(@Inject(EMPLOYEE_SERVICE) private readonly employees: ClientProxy) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return sendRpc(this.employees, Patterns.EMPLOYEE_CREATE, dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return sendRpc(this.employees, Patterns.EMPLOYEE_FIND_ALL, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return sendRpc(this.employees, Patterns.EMPLOYEE_FIND_ONE, { id });
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto) {
    return sendRpc(this.employees, Patterns.EMPLOYEE_UPDATE, { id, dto });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return sendRpc(this.employees, Patterns.EMPLOYEE_DELETE, { id });
  }
}
