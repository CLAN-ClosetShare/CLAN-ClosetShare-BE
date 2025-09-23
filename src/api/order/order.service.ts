import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import CreateOrderReqDto from './dto/create-order.req.dto';
import { ORDER_TYPE } from '@prisma/client';
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

      const paymentUrl = await this.payosService.createPaymentUrl({
        orderCode: order.orderCode,
        amount: total,
        description: `123123123`,
        cancelUrl: 'http://localhost:3000/order/cancel',
        returnUrl: 'http://localhost:3000/order/success',
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
}
