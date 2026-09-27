import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmployeeModule } from './employee.module';

async function bootstrap() {
  const port = Number(process.env.EMPLOYEE_SERVICE_PORT || 4002);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(EmployeeModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });
  await app.listen();
  Logger.log(`Employee service listening on TCP :${port}`, 'Bootstrap');
}
bootstrap();
