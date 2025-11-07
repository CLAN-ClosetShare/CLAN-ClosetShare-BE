import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OutfitService } from './outfit.service';
import { AuthGuard } from 'src/guards/auth.guard';
import CreateOutfitReqDto from './dto/create-outfit.req.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import AddClosetItemToOutfitReqDto from './dto/add-closet-item-to-outfit.req.dto';

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

  @Post(':id')
  @UseGuards(AuthGuard)
  async addClosetItemToOutfit(
    @Param('id') outfitId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() addClosetItemToOutfitReqDto: AddClosetItemToOutfitReqDto,
  ) {
    return await this.outfitService.addClosetItemToOutfit(
      outfitId,
      currentUser,
      addClosetItemToOutfitReqDto,
    );
  }

  @Get('public')
  async getAllOutfits(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('user_id') userId: string,
  ) {
    return await this.outfitService.getAllOutfits(page, limit, userId);
  }

  @Get(':id')
  async getOutfit(@Param('id') outfitId: string) {
    return await this.outfitService.getOutfit(outfitId);
  }

  @Get('')
  @UseGuards(AuthGuard)
  async getClosetItemsByUserId(
    @CurrentUser() currentUser: JwtPayloadType,
    @Query('userId') userId: string,
  ) {
    return await this.outfitService.getOutfitsByUserId(currentUser, userId);
  }
}
