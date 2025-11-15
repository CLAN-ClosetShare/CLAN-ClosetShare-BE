import { PRODUCT_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, ArrayMinSize, ValidateIf } from 'class-validator';

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
  @ValidateIf((o) => o.filter_props && o.filter_props.length > 0)
  @IsNotEmpty({ each: true })
  filter_props: string[];
}

export default CreateProductReqDto;
