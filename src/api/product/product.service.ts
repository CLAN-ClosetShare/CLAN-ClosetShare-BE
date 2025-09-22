import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly shopService: ShopService,
  ) {}

  async createProduct(
    currentUser: JwtPayloadType,
    shopId: string,
    createProductReqDto: any,
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
}
