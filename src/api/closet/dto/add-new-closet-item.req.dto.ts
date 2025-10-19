import { CLOSET_ITEM_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class AddNewClosetItemReqDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(CLOSET_ITEM_TYPE)
  type: CLOSET_ITEM_TYPE;
}

export default AddNewClosetItemReqDto;
