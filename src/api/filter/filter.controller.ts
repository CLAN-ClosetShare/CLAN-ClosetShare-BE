import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FilterService } from './filter.service';
import { CreateFilterReqDto, GetAllFilterResDto } from './dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('filters')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async createFilters(@Body() createFiltersReqDto: CreateFilterReqDto[]) {
    return await this.filterService.createFilters(createFiltersReqDto);
  }

  @Get()
  async getAllFilters(): Promise<GetAllFilterResDto> {
    return await this.filterService.getAllFilters();
  }
}
