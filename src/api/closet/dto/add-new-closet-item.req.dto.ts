import { CLOSET_ITEM_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class AddNewClosetItemReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(CLOSET_ITEM_TYPE)
  type: CLOSET_ITEM_TYPE;

  @IsOptional()
  @IsString()
  color_palette?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  style_tag?: string;
}

export default AddNewClosetItemReqDto;
