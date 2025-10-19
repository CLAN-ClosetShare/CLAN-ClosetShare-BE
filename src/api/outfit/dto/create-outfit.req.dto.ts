import { IsNotEmpty, IsString } from 'class-validator';

class CreateOutfitReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export default CreateOutfitReqDto;
