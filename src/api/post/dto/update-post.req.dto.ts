import { IsBoolean, IsOptional, IsString } from 'class-validator';

class UpdatePostReqDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

export default UpdatePostReqDto;
