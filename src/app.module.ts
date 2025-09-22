import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { PayosModule } from './payos/payos.module';
import authConfig from './api/auth/config/auth.config';
import databaseConfig from './database/config/database.config';
import payosConfig from './payos/config/payos.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, databaseConfig, payosConfig],
    }),
    DatabaseModule,
    ApiModule,
    PayosModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
