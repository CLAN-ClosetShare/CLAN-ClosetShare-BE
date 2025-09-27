import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

class CreateSubscriptionReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  price: number;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  duration_days: number;
}

export default CreateSubscriptionReqDto;
