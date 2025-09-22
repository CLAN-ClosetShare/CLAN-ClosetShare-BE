import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ShopService } from '../shop/shop.service';
import { CreateProductReqDto, CreateProductVariantReqDto } from './dto';

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
    const isValidStaff = await this.isValidStaff(shopId, currentUser.id);

    if (!isValidStaff) {
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

  async createProductVariant(
    currentUser: JwtPayloadType,
    productId: string,
    createProductVariantReqDto: CreateProductVariantReqDto,
  ) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new UnprocessableEntityException();
    }

    const isValidStaff = await this.isValidStaff(
      product.shop_id,
      currentUser.id,
    );
    if (!isValidStaff) {
      throw new UnauthorizedException();
    }

    const { price, ...rest } = createProductVariantReqDto;

    const variant = await this.prismaService.variant.create({
      data: {
        product_id: productId,
        ...rest,
      },
    });

    await this.prismaService.productPricing.create({
      data: {
        variant_id: variant.id,
        price,
      },
    });

    return {
      ...variant,
      price,
    };
  }

  async isValidStaff(shopId: string, userId: string): Promise<boolean> {
    const isValidStaff = await this.shopService.getStaffById(shopId, userId);

    if (!isValidStaff.length) {
      return false;
    }

    return true;
  }
}
