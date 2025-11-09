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
  SHOP_STAFF_STATUS,
} from '@prisma/client';
import { CloudflareService } from 'src/database/cloudflare.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly shopService: ShopService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  async createProduct(
    currentUser: JwtPayloadType,
    createProductReqDto: CreateProductReqDto,
  ) {
    const { filter_props, ...rest } = createProductReqDto;

    // Find shop where user is owner
    const shopStaff = await this.prismaService.shopStaff.findFirst({
      where: {
        user_id: currentUser.id,
        role: 'OWNER',
        status: SHOP_STAFF_STATUS.ACTIVE,
      },
    });

    if (!shopStaff) {
      throw new UnauthorizedException('You are not the owner of any shop');
    }

    const shopId = shopStaff.shop_id;

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
        type: type || undefined,
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
        filter_props: {
          include: {
            filterProp: true,
          },
        },
      },
    });

    // Fetch signed URLs for variant images and transform pricings into a single pricing object
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
    images: Express.Multer.File[], // Uploaded files passed from the controller
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

    const { price, stock, ...rest } = createProductVariantReqDto;

    // Upload images to Cloudflare
    const uploadedImageUrls = await Promise.all(
      images.map((image) => this.cloudflareService.uploadFile(image)),
    );

    // Add the uploaded image URLs to the product variant data
    const productVariantData = {
      ...createProductVariantReqDto,
      images: uploadedImageUrls,
    };

    const variant = await this.prismaService.variant.create({
      data: {
        product_id: productId,
        stock: parseInt(stock.toString()),
        images: uploadedImageUrls,
        ...rest,
      },
    });

    await this.prismaService.productPricing.create({
      data: {
        variant_id: variant.id,
        price: parseInt(price.toString()),
      },
    });

    return {
      message: 'Product variant created successfully',
      productVariantData,
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

    delete (product as any).created_at;
    delete (product as any).updated_at;
    delete (product as any).status;

    // Fetch signed URLs for variant images and transform pricings into a single pricing object
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

      delete (variant as any).pricings;
      delete (variant as any).created_at;
      delete (variant as any).updated_at;
      delete (variant as any).status;
    }

    return product;
  }
}
