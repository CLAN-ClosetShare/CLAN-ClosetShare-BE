import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

class CreateProductVariantReqDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;
}

export default CreateProductVariantReqDto;
