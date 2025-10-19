import { ClosetService } from './closet.service';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import AddNewClosetItemReqDto from './dto/add-new-closet-item.req.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

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
}
