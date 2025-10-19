import { Injectable } from '@nestjs/common';
import CreateOutfitReqDto from './dto/create-outfit.req.dto';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Injectable()
export class OutfitService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNewOutfit(
    createOutfitReqDto: CreateOutfitReqDto,
    currentUser: JwtPayloadType,
  ) {
    return await this.prismaService.outfit.create({
      data: {
        ...createOutfitReqDto,
        user_id: currentUser.id,
      },
    });
  }
}
