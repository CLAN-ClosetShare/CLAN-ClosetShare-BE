import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateShopReqDto, UpdateShopReqDto } from './dto';
import CreateShopResDto from './dto/create-shop.res.dto';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { Shop, SHOP_STAFF_STATUS } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  async createShop(
    userToken: JwtPayloadType,
    createShopReqDto: CreateShopReqDto,
  ): Promise<CreateShopResDto> {
    const shop = await this.prismaService.shop.create({
      data: { ...createShopReqDto },
    });

    await this.prismaService.shopStaff.create({
      data: {
        shop_id: shop.id,
        role: 'OWNER',
        user_id: userToken.id,
      },
    });

    return { ...shop };
  }

  async getShopById(id: string): Promise<Shop> {
    const shop = await this.prismaService.shop.findFirst({
      where: { id },
    });

    if (!shop) {
      throw new UnprocessableEntityException();
    }

    return shop;
  }

  async getShops({
    limit = 10,
    page = 1,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const shops = await this.prismaService.shop.findMany({
      where: {
        name: { contains: search },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.shop.count({
      where: {
        name: { contains: search },
      },
    });

    const total_pages = Math.ceil(total / limit);

    return {
      data: shops,
      pagination: {
        total,
        page,
        total_pages,
      },
    };
  }

  async updateShop(
    shopId: string,
    userToken: JwtPayloadType,
    updateShopReqDto: UpdateShopReqDto,
  ): Promise<Shop> {
    const shop = await this.getShopById(shopId);
    if (!shop) {
      throw new UnprocessableEntityException();
    }

    const staff = await this.prismaService.shopStaff.findFirst({
      where: {
        shop_id: shopId,
        user_id: userToken.id,
        status: 'ACTIVE',
      },
    });

    if (!staff || staff.role !== 'OWNER') {
      throw new UnauthorizedException();
    }

    return await this.prismaService.shop.update({
      where: { id: shopId },
      data: { ...updateShopReqDto },
    });
  }

  async deleteShop(shopId: string, userToken: JwtPayloadType) {
    const shop = await this.getShopById(shopId);
    if (!shop) {
      throw new UnprocessableEntityException();
    }

    const staff = await this.prismaService.shopStaff.findFirst({
      where: {
        shop_id: shopId,
        user_id: userToken.id,
        status: 'ACTIVE',
      },
    });

    if (!staff || staff.role !== 'OWNER') {
      throw new UnauthorizedException();
    }

    return await this.prismaService.shop.update({
      where: { id: shopId },
      data: {
        status: 'SUSPENDED',
      },
    });
  }

  async getStaffById(shopId: string, userId?: string) {
    return await this.prismaService.shopStaff.findMany({
      where: {
        shop_id: shopId,
        user_id: userId,
        status: SHOP_STAFF_STATUS.ACTIVE,
      },
    });
  }
}
