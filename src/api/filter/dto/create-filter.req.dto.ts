import { IsNotEmpty, IsString } from 'class-validator';

class CreateFilterReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;
}

export default CreateFilterReqDto;
