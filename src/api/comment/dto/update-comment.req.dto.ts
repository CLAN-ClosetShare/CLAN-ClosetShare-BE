import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentReqDto {
  @IsString()
  @IsOptional()
  content?: string;
}
