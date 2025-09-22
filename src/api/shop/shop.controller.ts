import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopReqDto, UpdateShopReqDto } from './dto';
import CreateShopResDto from './dto/create-shop.res.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async createShop(
    @Body() createShopDto: CreateShopReqDto,
    @CurrentUser() userToken: JwtPayloadType,
  ): Promise<CreateShopResDto> {
    return await this.shopService.createShop(userToken, createShopDto);
  }

  @Get(':id')
  async getShopById(@Param('id') id: string) {
    return await this.shopService.getShopById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateShop(
    @Param('id') id: string,
    @Body() updateShopReqDto: UpdateShopReqDto,
    @CurrentUser() userToken: JwtPayloadType,
  ) {
    return await this.shopService.updateShop(id, userToken, updateShopReqDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteShop(
    @Param('id') id: string,
    @CurrentUser() userToken: JwtPayloadType,
  ) {
    return await this.shopService.deleteShop(id, userToken);
  }
}
