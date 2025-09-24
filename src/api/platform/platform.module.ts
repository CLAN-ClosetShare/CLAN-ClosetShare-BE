import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { PayosModule } from 'src/payos/payos.module';

@Module({
  imports: [PayosModule],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
