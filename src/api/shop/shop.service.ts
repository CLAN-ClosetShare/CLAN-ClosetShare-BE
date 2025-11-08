import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateShopReqDto, UpdateShopReqDto } from './dto';
import CreateShopResDto from './dto/create-shop.res.dto';
import { PrismaService } from 'src/database/prisma.service';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import {
  Shop,
  SHOP_STAFF_STATUS,
  PRODUCT_STATUS,
  PRODUCT_TYPE,
} from '@prisma/client';
import { CloudflareService } from 'src/database/cloudflare.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}

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

  async getShopByUserId(
    userId: string,
    {
      page = 1,
      limit = 10,
      search,
      type,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      type?: PRODUCT_TYPE;
    },
  ) {
    // Find shop by userId through ShopStaff with role OWNER
    const shopStaff = await this.prismaService.shopStaff.findFirst({
      where: {
        user_id: userId,
        role: 'OWNER',
        status: SHOP_STAFF_STATUS.ACTIVE,
      },
      include: {
        shop: true,
      },
    });

    if (!shopStaff || !shopStaff.shop) {
      throw new UnprocessableEntityException('Shop not found for this user');
    }

    const shop = shopStaff.shop;
    const shopId = shop.id;

    // Get products with pagination and search
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        where: {
          shop_id: shopId,
          name: search ? { contains: search } : undefined,
          type: type || undefined,
          status: PRODUCT_STATUS.ACTIVE,
        },
        skip,
        take: limit,
        include: {
          variants: {
            include: {
              pricings: true,
            },
          },
          filter_props: {
            include: {
              filterProp: true,
            },
          },
        },
      }),
      this.prismaService.product.count({
        where: {
          shop_id: shopId,
          name: search ? { contains: search } : undefined,
          type: type || undefined,
          status: PRODUCT_STATUS.ACTIVE,
        },
      }),
    ]);

    // Process products: transform images and pricings
    for (const product of products) {
      delete (product as any).created_at;
      delete (product as any).updated_at;
      delete (product as any).status;

      for (const variant of product.variants) {
        // Replace image keys with signed URLs
        if (variant.images && variant.images.length > 0) {
          const signedUrls = await Promise.all(
            variant.images.map(async (imageKey: string) => {
              return await this.cloudflareService.getDownloadedUrl(imageKey);
            }),
          );
          variant.images = signedUrls;
        }

        // Transform pricings into a single pricing object
        const activePricing = variant.pricings.find((pricing) => {
          const now = new Date();
          return (
            (!pricing.start_date || new Date(pricing.start_date) <= now) &&
            (!pricing.end_date || new Date(pricing.end_date) >= now)
          );
        });

        (variant as any).pricing = activePricing
          ? {
              price: activePricing.price,
              start_date: activePricing.start_date,
              end_date: activePricing.end_date,
            }
          : null;

        // Remove the original pricings array
        delete (variant as any).pricings;
        delete (variant as any).created_at;
        delete (variant as any).updated_at;
        delete (variant as any).status;
      }
    }

    const total_pages = Math.ceil(total / limit);

    return {
      shop,
      products: {
        data: products,
        pagination: {
          total,
          page,
          total_pages,
        },
      },
    };
  }
}
