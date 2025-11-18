import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import CreateOrderReqDto from './dto/create-order.req.dto';
import {
  ORDER_STATUS,
  ORDER_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@prisma/client';
import { ProductService } from '../product/product.service';
import { PayosService } from 'src/payos/payos.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
    private readonly payosService: PayosService,
  ) {}

  async createOrder(
    currentUser: JwtPayloadType,
    createOrderReqDto: CreateOrderReqDto,
  ) {
    const { type, item, ...rest } = createOrderReqDto;
    const orderCodeSequence = await this.prismaService.$queryRawUnsafe<
      { nextval: number }[]
    >(`SELECT nextval('shared_order_code_seq')`);

    const orderCode = Number(orderCodeSequence[0].nextval);

    //TODO: handle rent order
    if (type === ORDER_TYPE.RENT) {
    } else {
      const { total, variants } =
        await this.productService.getOrderTotalPrice(item);
      const order = await this.prismaService.order.create({
        data: {
          user_id: currentUser.id,
          ...rest,
          total_value: total,
          final_value: total,
          type: ORDER_TYPE.SALE,
          order_code: orderCode,
        },
      });

      const orderDetailItems = variants.reduce(
        (
          acc: {
            order_id: string;
            variant_id: string;
            quantity: number;
            price: number;
          }[],
          variant,
        ) => {
          acc.push({
            order_id: order.id,
            variant_id: variant.variant_id,
            quantity: variant.quantity,
            price: variant.price,
          });
          return acc;
        },
        [],
      );

      await this.prismaService.orderDetail.createMany({
        data: orderDetailItems,
      });

      await Promise.all(
        orderDetailItems.map(async (item) => {
          await this.prismaService.variant.update({
            where: { id: item.variant_id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }),
      );

      const paymentUrl = await this.payosService.createPaymentUrl({
        orderCode: order.order_code,
        amount: total,
        description: order.order_code.toString(),
        cancelUrl: 'http://localhost:3000/orders/result',
        returnUrl: 'http://localhost:3000/orders/result',
        items: orderDetailItems.map((item) => ({
          name: `Variant ${item.variant_id}`,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return {
        order,
        paymentUrl,
      };
    }
  }

  async handleOrderResult({
    orderCode,
    status,
    cancel,
  }: {
    orderCode: number;
    id: string;
    status: 'PAID' | 'CANCELLED';
    cancel: boolean;
  }) {
    let orderResult;
    if (status == 'PAID') {
      orderResult = await this.prismaService.order.update({
        where: {
          order_code: orderCode,
        },
        data: {
          status: ORDER_STATUS.DELIVERING,
        },
      });

      await this.prismaService.transaction.create({
        data: {
          order_id: orderResult.id,
          status: TRANSACTION_STATUS.PAID,
          ammount: orderResult.final_value,
          type: TRANSACTION_TYPE.PAYIN,
        },
      });
    } else if (status == 'CANCELLED' || cancel) {
      orderResult = await this.prismaService.order.update({
        where: {
          order_code: orderCode,
        },
        data: {
          status: ORDER_STATUS.CANCELED,
        },
      });

      const orderDetails = await this.prismaService.orderDetail.findMany({
        where: {
          order_id: orderResult.id,
        },
      });

      await Promise.all(
        orderDetails.map(async (item) => {
          await this.prismaService.variant.update({
            where: { id: item.variant_id },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }),
      );

      await this.prismaService.transaction.create({
        data: {
          order_id: orderResult.id,
          status: TRANSACTION_STATUS.CANCELLED,
          ammount: orderResult.final_value,
          type: TRANSACTION_TYPE.PAYIN,
        },
      });
    }

    return orderResult;
  }

  async getOrdersByUser({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const pageNumber = page && page > 0 ? page : 1;
    const limitNumber = limit && limit > 0 ? limit : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, total] = await this.prismaService.$transaction([
      this.prismaService.order.findMany({
        where: { user_id: userId },
        include: {
          order_details: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
          transactions: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNumber,
      }),
      this.prismaService.order.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      data: orders,
      pagination: {
        total,
        page: pageNumber,
        total_pages: Math.ceil(total / limitNumber) || 0,
      },
    };
  }
}
