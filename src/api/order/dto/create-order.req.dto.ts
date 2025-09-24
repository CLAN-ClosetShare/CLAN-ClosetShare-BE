import { ORDER_TYPE, PAYMENT_METHOD } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

class CreateOrderReqDto {
  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  province_id: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  ward_id: number;

  @IsEnum(ORDER_TYPE)
  @IsNotEmpty()
  type: ORDER_TYPE;

  @IsEnum(PAYMENT_METHOD)
  @IsNotEmpty()
  payment_method: PAYMENT_METHOD;

  item: {
    variant_id: string;
    quantity: string;
  }[];
}

export default CreateOrderReqDto;
