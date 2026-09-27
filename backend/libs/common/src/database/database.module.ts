import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from '../entities';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.get('DB_HOST', '127.0.0.1'),
            port: Number(config.get('DB_PORT', 3306)),
            username: config.get('DB_USER', 'root'),
            password: config.get('DB_PASSWORD', ''),
            database: config.get('DB_NAME', 'dexa_wfh'),
            entities: ENTITIES,
            synchronize: config.get('DB_SYNC') === 'true',
            timezone: 'local',
          }),
        }),
      ],
    };
  }
}
