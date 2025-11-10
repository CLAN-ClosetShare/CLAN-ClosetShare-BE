import { PRODUCT_TYPE } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class UpdateProductReqDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PRODUCT_TYPE)
  type?: PRODUCT_TYPE;

  @IsOptional()
  @IsString({ each: true })
  filter_props?: string[];
}

export default UpdateProductReqDto;
