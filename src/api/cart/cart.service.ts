import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PRODUCT_STATUS } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly cartInclude = {
    items: {
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    },
  };

  private async ensureCart(userId: string) {
    return await this.prismaService.cart.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
  }

  async getCart(userId: string) {
    await this.ensureCart(userId);
    return await this.prismaService.cart.findUnique({
      where: { user_id: userId },
      include: this.cartInclude,
    });
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto) {
    const cart = await this.ensureCart(userId);

    const variant = await this.prismaService.variant.findFirst({
      where: {
        id: addCartItemDto.variant_id,
        status: PRODUCT_STATUS.ACTIVE,
        product: {
          status: PRODUCT_STATUS.ACTIVE,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found or inactive');
    }

    await this.prismaService.cartItem.upsert({
      where: {
        cart_id_variant_id: {
          cart_id: cart.id,
          variant_id: addCartItemDto.variant_id,
        },
      },
      update: {
        quantity: addCartItemDto.quantity,
      },
      create: {
        cart_id: cart.id,
        variant_id: addCartItemDto.variant_id,
        quantity: addCartItemDto.quantity,
      },
    });

    return await this.getCart(userId);
  }

  async updateItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cartItem = await this.prismaService.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          user_id: userId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prismaService.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: updateCartItemDto.quantity,
      },
    });

    return await this.getCart(userId);
  }

  async removeItem(userId: string, cartItemId: string) {
    const cartItem = await this.prismaService.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          user_id: userId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prismaService.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });

    return await this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prismaService.cart.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      await this.ensureCart(userId);
      return await this.getCart(userId);
    }

    await this.prismaService.cartItem.deleteMany({
      where: {
        cart_id: cart.id,
      },
    });

    return await this.getCart(userId);
  }
}
