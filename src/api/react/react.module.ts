import { Module } from '@nestjs/common';
import { ReactController } from './react.controller';
import { ReactService } from './react.service';

@Module({
  imports: [],
  controllers: [ReactController],
  providers: [ReactService],
  exports: [ReactService],
})
export class ReactModule {}
