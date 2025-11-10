import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

class UpdateProductVariantReqDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}

export default UpdateProductVariantReqDto;
