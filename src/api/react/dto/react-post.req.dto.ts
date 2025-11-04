import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReactPostReqDto {
  @IsNotEmpty()
  @IsUUID()
  post_id: string;
}
