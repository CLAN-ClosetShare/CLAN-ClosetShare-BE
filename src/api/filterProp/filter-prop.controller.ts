import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FilterPropService } from './filter-prop.service';
import { CreateFilterPropReqDto } from './dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('filter-props')
export class FilterPropController {
  constructor(private readonly filterPropService: FilterPropService) {}
  //TODO: add role based access control
  @Post('')
  @UseGuards(AuthGuard)
  async createFilterProps(
    @Body() createFilterPropReqDto: CreateFilterPropReqDto,
  ) {
    return await this.filterPropService.createFilterProps(
      createFilterPropReqDto,
    );
  }
}
