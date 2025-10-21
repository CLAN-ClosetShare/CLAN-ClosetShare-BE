import { PrismaService } from 'src/database/prisma.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import AddNewClosetItemReqDto from './dto/add-new-closet-item.req.dto';
import { CloudflareService } from 'src/database/cloudflare.service';
import UpdateClosetItemReqDto from './dto/update-closet-item.req.dto';
import { CLOSET_ITEM_TYPE } from '@prisma/client';

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

  async getClosetItemsByUserId({
    currentUser,
    limit = 10,
    page = 1,
    type,
    userId,
  }: {
    currentUser?: JwtPayloadType;
    userId?: string;
    page?: number;
    limit?: number;
    type?: CLOSET_ITEM_TYPE;
  }) {
    const closetItems = await this.prismaService.closetItem.findMany({
      where: {
        user_id: userId || currentUser?.id,
        type: type || undefined,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    for (const closetItem of closetItems) {
      const signedUrl = await this.cloudflareService.getDownloadedUrl(
        closetItem.image,
      );
      closetItem.image = signedUrl;
    }

    const total = await this.prismaService.closetItem.count({
      where: {
        user_id: userId || currentUser?.id,
        type: type || undefined,
      },
    });
    const total_pages = Math.ceil(total / limit);

    return {
      data: closetItems,
      pagination: {
        total,
        page,
        total_pages,
      },
    };
  }

  async deleteClosetItem(closetItemId: string, currentUser: JwtPayloadType) {
    const closetItem = await this.prismaService.closetItem.findFirst({
      where: {
        id: closetItemId,
      },
    });

    if (!closetItem) {
      throw new NotFoundException('ClosetItem not found');
    }

    if (closetItem.user_id !== currentUser.id) {
      throw new UnauthorizedException(
        "You don't have permission to delete this ClosetItem",
      );
    }

    //TODO: if outfit contains this closet item => block delete

    return await this.prismaService.closetItem.delete({
      where: {
        id: closetItemId,
      },
    });
  }

  async getItemById(id: string) {
    return await this.prismaService.closetItem.findFirst({
      where: {
        id,
      },
    });
  }
}
