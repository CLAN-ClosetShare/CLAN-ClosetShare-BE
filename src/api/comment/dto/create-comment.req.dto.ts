import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentReqDto {
  @IsNotEmpty()
  @IsUUID()
  post_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  quote_comment_id?: string;
}
