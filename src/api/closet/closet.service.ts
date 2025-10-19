import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import AddNewClosetItemReqDto from './dto/add-new-closet-item.req.dto';
import { CloudflareService } from 'src/database/cloudflare.service';

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
}
