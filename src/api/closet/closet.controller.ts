import { ClosetService } from './closet.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import AddNewClosetItemReqDto from './dto/add-new-closet-item.req.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import UpdateClosetItemReqDto from './dto/update-closet-item.req.dto';
import { CLOSET_ITEM_TYPE } from '@prisma/client';

@Controller('closets')
export class ClosetController {
  constructor(private readonly closetService: ClosetService) {}

  @Post('')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('image'))
  async addNewClosetItem(
    @CurrentUser() currentUser: JwtPayloadType,
    @UploadedFiles() image: Express.Multer.File[],
    @Body() addNewClosetItemReqDto: AddNewClosetItemReqDto,
  ) {
    return await this.closetService.addNewClosetItem(
      currentUser,
      image,
      addNewClosetItemReqDto,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('image'))
  async updateClosetItem(
    @Param('id') closetItemId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @UploadedFiles() image: Express.Multer.File[],
    @Body() updateClosetItemReqDto: UpdateClosetItemReqDto,
  ) {
    return await this.closetService.updateClosetItem(
      closetItemId,
      currentUser,
      image,
      updateClosetItemReqDto,
    );
  }

  @Get('')
  @UseGuards(AuthGuard)
  async getClosetItemsByUserId(
    @CurrentUser() currentUser: JwtPayloadType,
    @Query('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('type') type: CLOSET_ITEM_TYPE,
  ) {
    return await this.closetService.getClosetItemsByUserId({
      currentUser,
      userId,
      page: page ? Number.parseInt(page) : undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
      type,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteClosetItem(
    @Param('id') closetItemId: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.closetService.deleteClosetItem(closetItemId, currentUser);
  }
}
