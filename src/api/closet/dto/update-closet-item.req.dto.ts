import { CLOSET_ITEM_TYPE } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class UpdateClosetItemReqDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CLOSET_ITEM_TYPE)
  type?: CLOSET_ITEM_TYPE;

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

export default UpdateClosetItemReqDto;
