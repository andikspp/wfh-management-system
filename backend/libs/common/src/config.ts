import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// Semua service membaca satu file backend/.env
export const AppConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: join(process.cwd(), '.env'),
});
