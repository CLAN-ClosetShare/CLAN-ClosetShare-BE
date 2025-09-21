import { IsNotEmpty, IsString } from 'class-validator';

class UpdateShopReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  avatar_url?: string;

  @IsString()
  background_url?: string;
}

export default UpdateShopReqDto;
