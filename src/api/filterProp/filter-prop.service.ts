import { Injectable } from '@nestjs/common';
import { CreateFilterPropReqDto } from './dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class FilterPropService {
  constructor(private readonly prismaService: PrismaService) {}

  async createFilterProps(createFilterPropReqDto: CreateFilterPropReqDto) {
    const { filter_id, filter_props } = createFilterPropReqDto;
    const filterProps = filter_props.reduce(
      (
        props: {
          name: string;
          description: string;
          filter_id: string;
        }[],
        currentProp,
      ) => [
        ...props,
        {
          name: currentProp.name,
          description: currentProp.description,
          filter_id: filter_id,
        },
      ],
      [],
    );

    return await this.prismaService.filterProp.createManyAndReturn({
      data: filterProps,
    });
  }
}
