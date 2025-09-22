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
}

export default CreateProductReqDto;
