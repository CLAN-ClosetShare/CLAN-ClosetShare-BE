import { Module } from '@nestjs/common';
import { OutfitController } from './outfit.controller';
import { OutfitService } from './outfit.service';
import { ClosetModule } from '../closet/closet.module';

@Module({
  imports: [ClosetModule],
  controllers: [OutfitController],
  providers: [OutfitService],
})
export class OutfitModule {}
