import { IsArray, IsNotEmpty } from 'class-validator';

class AddClosetItemToOutfitReqDto {
  @IsArray()
  @IsNotEmpty()
  closet_item_ids: string[];
}

export default AddClosetItemToOutfitReqDto;
