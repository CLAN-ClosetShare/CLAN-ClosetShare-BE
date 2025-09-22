import { Module } from '@nestjs/common';
import { FilterPropController } from './filter-prop.controller';
import { FilterPropService } from './filter-prop.service';

@Module({
  controllers: [FilterPropController],
  providers: [FilterPropService],
})
export class FilterPropModule {}
