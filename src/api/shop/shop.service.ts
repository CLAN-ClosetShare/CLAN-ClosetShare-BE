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
  SHOP_STATUS,
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
    avatar?: Express.Multer.File,
    background?: Express.Multer.File,
  ): Promise<CreateShopResDto> {
    // Check if user already owns a shop
    const existingShopOwner = await this.prismaService.shopStaff.findFirst({
      where: {
        user_id: userToken.id,
        role: 'OWNER',
        status: SHOP_STAFF_STATUS.ACTIVE,
      },
    });

    if (existingShopOwner) {
      throw new UnprocessableEntityException(
        'User already owns a shop. Each user can only own one shop.',
      );
    }

    let avatarKey: string | undefined;
    let backgroundKey: string | undefined;

    // Upload avatar if provided
    if (avatar) {
      avatarKey = await this.cloudflareService.uploadFile(avatar);
    }

    // Upload background if provided
    if (background) {
      backgroundKey = await this.cloudflareService.uploadFile(background);
    }

    const shop = await this.prismaService.shop.create({
      data: {
        ...createShopReqDto,
        avatar: avatarKey,
        background: backgroundKey,
      },
    });

    await this.prismaService.shopStaff.create({
      data: {
        shop_id: shop.id,
        role: 'OWNER',
        user_id: userToken.id,
      },
    });

    // Transform avatar and background keys to URLs
    const shopWithUrls = { ...shop };
    if (shopWithUrls.avatar) {
      shopWithUrls.avatar = await this.cloudflareService.getDownloadedUrl(
        shopWithUrls.avatar,
      );
    }
    if (shopWithUrls.background) {
      shopWithUrls.background = await this.cloudflareService.getDownloadedUrl(
        shopWithUrls.background,
      );
    }

    return shopWithUrls;
  }

  async getShopById(id: string): Promise<any> {
    const shop = await this.prismaService.shop.findFirst({
      where: {
        id,
        status: { not: SHOP_STATUS.SUSPENDED },
      },
    });

    if (!shop) {
      throw new UnprocessableEntityException();
    }

    // Transform avatar and background keys to URLs
    const shopWithUrls = { ...shop };
    if (shopWithUrls.avatar) {
      shopWithUrls.avatar = await this.cloudflareService.getDownloadedUrl(
        shopWithUrls.avatar,
      );
    }
    if (shopWithUrls.background) {
      shopWithUrls.background = await this.cloudflareService.getDownloadedUrl(
        shopWithUrls.background,
      );
    }

    return shopWithUrls;
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
        status: { not: SHOP_STATUS.SUSPENDED },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.shop.count({
      where: {
        name: { contains: search },
        status: { not: SHOP_STATUS.SUSPENDED },
      },
    });

    const total_pages = Math.ceil(total / limit);

    // Transform avatar and background keys to URLs for all shops
    const shopsWithUrls = await Promise.all(
      shops.map(async (shop) => {
        const shopWithUrls = { ...shop };
        if (shopWithUrls.avatar) {
          shopWithUrls.avatar = await this.cloudflareService.getDownloadedUrl(
            shopWithUrls.avatar,
          );
        }
        if (shopWithUrls.background) {
          shopWithUrls.background =
            await this.cloudflareService.getDownloadedUrl(
              shopWithUrls.background,
            );
        }
        return shopWithUrls;
      }),
    );

    return {
      data: shopsWithUrls,
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
        shop: {
          status: { not: SHOP_STATUS.SUSPENDED },
        },
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
          shop: {
            status: { not: SHOP_STATUS.SUSPENDED },
          },
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
          shop: {
            status: { not: SHOP_STATUS.SUSPENDED },
          },
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

    // Transform avatar and background keys to URLs
    const shopWithUrls = { ...shop };
    if (shopWithUrls.avatar) {
      shopWithUrls.avatar = await this.cloudflareService.getDownloadedUrl(
        shopWithUrls.avatar,
      );
    }
    if (shopWithUrls.background) {
      shopWithUrls.background = await this.cloudflareService.getDownloadedUrl(
        shopWithUrls.background,
      );
    }

    return {
      shop: shopWithUrls,
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
