import { Module } from '@nestjs/common';
import { ClosetController } from './closet.controller';
import { ClosetService } from './closet.service';

@Module({
  imports: [],
  controllers: [ClosetController],
  providers: [ClosetService],
  exports: [],
})
export class ClosetModule {}
