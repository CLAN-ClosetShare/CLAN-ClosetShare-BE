import { Injectable } from '@nestjs/common';
import { CreateFilterReqDto, GetAllFilterResDto } from './dto';
import { PrismaService } from 'src/database/prisma.service';
import { FILTER_STATUS } from '@prisma/client';

@Injectable()
export class FilterService {
  constructor(private readonly prismaService: PrismaService) {}

  async createFilters(createFiltersReqDto: CreateFilterReqDto[]) {
    return await this.prismaService.filter.createManyAndReturn({
      data: createFiltersReqDto,
      skipDuplicates: true,
    });
  }

  async getAllFilters(): Promise<GetAllFilterResDto> {
    const filters = await this.prismaService.filter.findMany({
      where: { status: FILTER_STATUS.ACTIVE },
      include: { props: true },
    });
    const count = await this.prismaService.filter.count();
    return { count, filters };
  }
}
