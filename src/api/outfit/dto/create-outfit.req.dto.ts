import { IsOptional, IsString } from 'class-validator';

class CreateOutfitReqDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  color_theme?: string;
}

export default CreateOutfitReqDto;
