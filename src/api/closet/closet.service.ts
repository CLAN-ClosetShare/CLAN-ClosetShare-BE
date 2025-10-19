import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import AddNewClosetItemReqDto from './dto/add-new-closet-item.req.dto';
import { CloudflareService } from 'src/database/cloudflare.service';
import UpdateClosetItemReqDto from './dto/update-closet-item.req.dto';

@Injectable()
export class ClosetService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  async addNewClosetItem(
    currentUser: JwtPayloadType,
    image: Express.Multer.File[],
    addNewClosetItemReqDto: AddNewClosetItemReqDto,
  ) {
    const user_id = currentUser.id;

    const image_filename = await this.cloudflareService.uploadFile(image[0]);

    return await this.prismaService.closetItem.create({
      data: {
        ...addNewClosetItemReqDto,
        user_id,
        image: image_filename,
      },
    });
  }

  async updateClosetItem(
    closetItemId: string,
    currentUser: JwtPayloadType,
    image: Express.Multer.File[],
    updateClosetItemReqDto: UpdateClosetItemReqDto,
  ) {
    const closetItem = await this.prismaService.closetItem.findFirst({
      where: {
        id: closetItemId,
        user_id: currentUser.id,
      },
    });

    if (!closetItem) {
      throw new NotFoundException('ClosetItem not found');
    }

    if (image[0]) {
      const image_keyname = await this.cloudflareService.uploadFile(image[0]);

      return await this.prismaService.closetItem.update({
        where: {
          id: closetItemId,
        },
        data: {
          ...updateClosetItemReqDto,
          image: image_keyname,
        },
      });
    }
  }
}
