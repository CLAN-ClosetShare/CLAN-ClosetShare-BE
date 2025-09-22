import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ShopService } from '../shop/shop.service';
import { CreateProductReqDto } from './dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly shopService: ShopService,
  ) {}

  async createProduct(
    currentUser: JwtPayloadType,
    shopId: string,
    createProductReqDto: CreateProductReqDto,
  ) {
    const isValidStaff = await this.shopService.getStaffById(
      shopId,
      currentUser.id,
    );

    if (!isValidStaff.length) {
      throw new UnauthorizedException();
    }

    return await this.prismaService.product.create({
      data: {
        shop_id: shopId,
        ...createProductReqDto,
      },
    });
  }

  async getAllProductsByShopId(shopId: string) {
    return await this.prismaService.product.findMany({
      where: { shop_id: shopId },
    });
  }
}
