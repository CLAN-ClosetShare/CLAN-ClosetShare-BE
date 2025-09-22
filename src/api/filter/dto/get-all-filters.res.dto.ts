import { Filter, FilterProp } from '@prisma/client';

class GetAllFilterResDto {
  count: number;
  filters: (Filter & {
    props: FilterProp[];
  })[];
}

export default GetAllFilterResDto;
