import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateShopReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export default CreateShopReqDto;
