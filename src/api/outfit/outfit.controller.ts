import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OutfitService } from './outfit.service';
import { AuthGuard } from 'src/guards/auth.guard';
import CreateOutfitReqDto from './dto/create-outfit.req.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Controller('outfits')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async createNewOutfit(
    @Body() createOutfitReqDto: CreateOutfitReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.outfitService.createNewOutfit(
      createOutfitReqDto,
      currentUser,
    );
  }
}
