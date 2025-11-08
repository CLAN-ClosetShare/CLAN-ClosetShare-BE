import { IsOptional, IsString } from 'class-validator';

export class UpdateUserReqDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;
}
