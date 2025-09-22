import { IsNotEmpty, IsString } from 'class-validator';
import { CreateFilterReqDto } from 'src/api/filter/dto';

class CreateFilterPropReqDto {
  @IsString()
  @IsNotEmpty()
  filter_id: string;

  filter_props: CreateFilterReqDto[];
}

export default CreateFilterPropReqDto;
