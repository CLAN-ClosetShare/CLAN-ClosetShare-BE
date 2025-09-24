import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ShopService } from '../shop/shop.service';
import { CreateProductReqDto, CreateProductVariantReqDto } from './dto';
import {
  PRODUCT_PRICING_STATUS,
  PRODUCT_STATUS,
  PRODUCT_TYPE,
} from '@prisma/client';

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
    const { filter_props, ...rest } = createProductReqDto;

    const isValidStaff = await this.isValidStaff(shopId, currentUser.id);

    if (!isValidStaff) {
      throw new UnauthorizedException();
    }

    const product = await this.prismaService.product.create({
      data: {
        shop_id: shopId,
        ...rest,
      },
    });

    const productByFilterProps = filter_props.reduce(
      (
        acc: {
          product_id: string;
          filter_prop_id: string;
        }[],
        prop,
      ) => {
        acc.push({ product_id: product.id, filter_prop_id: prop });
        return acc;
      },
      [],
    );

    await this.prismaService.productByFilterProp.createMany({
      data: productByFilterProps,
    });
  }

  async getAllProductsByShopId({
    limit = 10,
    page = 1,
    shopId,
    search,
    type,
  }: {
    shopId?: string;
    page?: number;
    limit?: number;
    search?: string;
    type?: PRODUCT_TYPE;
  }) {
    const products = await this.prismaService.product.findMany({
      where: {
        shop_id: shopId,
        name: { contains: search },
        type: type ? type : undefined,
        status: PRODUCT_STATUS.ACTIVE,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        variants: {
          include: {
            pricings: true,
          },
        },
      },
    });
    const total = await this.prismaService.product.count({
      where: { shop_id: shopId, name: { contains: search }, type },
    });
    const total_pages = Math.ceil(total / limit);

    return {
      data: products,
      pagination: {
        total,
        page,
        total_pages,
      },
    };
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

  async getOrderTotalPrice(items: { variant_id: string; quantity: string }[]) {
    let total = 0;
    const variants: {
      variant_id: string;
      quantity: number;
      price: number;
    }[] = [];
    for (const item of items) {
      const variant = await this.prismaService.variant.findFirst({
        where: {
          id: item.variant_id,
          status: PRODUCT_STATUS.ACTIVE,
          stock: {
            gte: parseInt(item.quantity),
          },
        },

        select: {
          pricings: {
            where: {
              status: PRODUCT_PRICING_STATUS.ACTIVE,
            },
          },
        },
      });
      if (!variant) {
        throw new UnprocessableEntityException('Invalid variant id');
      }
      const newDate = new Date();

      variant.pricings.find((pricing) =>
        pricing.end_date
          ? pricing.start_date < newDate && pricing.end_date > newDate
          : pricing.start_date < newDate,
      );

      if (!variant.pricings.length) {
        throw new UnprocessableEntityException('No active pricing found');
      }
      variants.push({
        variant_id: item.variant_id,
        quantity: parseInt(item.quantity),
        price: variant.pricings[0].price,
      });
      total += variant.pricings[0].price * parseInt(item.quantity);
    }
    return { total, variants };
  }

  //TODO: handle discount price
  async getProductById(productId: string) {
    const product = await this.prismaService.product.findFirst({
      where: { id: productId, status: PRODUCT_STATUS.ACTIVE },
      include: {
        variants: {
          include: {
            pricings: true,
          },
        },
      },
    });

    if (!product) {
      throw new UnprocessableEntityException();
    }

    return product;
  }
}
