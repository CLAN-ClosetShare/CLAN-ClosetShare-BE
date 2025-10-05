import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostReqDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export default CreatePostReqDto;
