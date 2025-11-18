import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
