import { CLOSET_ITEM_TYPE } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

class UpdateClosetItemReqDto {
  @IsString()
  name: string;

  @IsEnum(CLOSET_ITEM_TYPE)
  type: CLOSET_ITEM_TYPE;
}

export default UpdateClosetItemReqDto;
