import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopReqDto, UpdateShopReqDto } from './dto';
import CreateShopResDto from './dto/create-shop.res.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
  )
  async createShop(
    @Body() createShopDto: CreateShopReqDto,
    @CurrentUser() userToken: JwtPayloadType,
    @UploadedFiles()
    files?: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ): Promise<CreateShopResDto> {
    const avatar = files?.avatar?.[0];
    const background = files?.background?.[0];

    return await this.shopService.createShop(
      userToken,
      createShopDto,
      avatar,
      background,
    );
  }

  @Get('user/:userId')
  async getShopByUserId(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return await this.shopService.getShopByUserId(userId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      type: type as any,
    });
  }

  @Get(':id')
  async getShopById(@Param('id') id: string) {
    return await this.shopService.getShopById(id);
  }

  @Get('')
  async getShops(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    return await this.shopService.getShops({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
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
