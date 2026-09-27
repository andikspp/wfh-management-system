import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);
  const port = Number(process.env.GATEWAY_PORT || 3000);
  const uploadDir = resolve(process.env.UPLOAD_DIR || 'uploads');
  mkdirSync(uploadDir, { recursive: true });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',') });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  const swagger = new DocumentBuilder()
    .setTitle('Dexa WFH Attendance API')
    .setDescription('API Gateway untuk aplikasi absensi WFH & monitoring karyawan')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  await app.listen(port);
  Logger.log(`Gateway on http://localhost:${port}/api  (docs: /docs)`, 'Bootstrap');
}
bootstrap();
