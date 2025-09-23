import { PRODUCT_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class CreateProductReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsEnum(PRODUCT_TYPE)
  type: PRODUCT_TYPE;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  filter_props: string[];
}

export default CreateProductReqDto;
