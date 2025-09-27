import { JwtPayloadType } from './../auth/types/jwt-payload.type';
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSubscriptionOrderReqDto, CreateSubscriptionReqDto } from './dto';
import { UserService } from '../user/user.service';
import {
  SUBSCRIPTION_ORDER_STATUS,
  SUBSCRIPTION_PLAN_STATUS,
  USER_ROLE,
} from '@prisma/client';
import { PayosService } from 'src/payos/payos.service';
import { PAYMENT_STATUS } from 'src/payos/constants/payment-status';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly payosService: PayosService,
  ) {}

  async createSubscriptionOrder(
    createSubscriptionOrderReqDto: CreateSubscriptionOrderReqDto,
    currentUser: JwtPayloadType,
  ) {
    const { id } = currentUser;

    if (!id) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new UnauthorizedException();
    }

    console.log(createSubscriptionOrderReqDto.subscription_plan_id);

    const subscriptionPlan =
      await this.prismaService.subscriptionPlan.findUnique({
        where: {
          id: createSubscriptionOrderReqDto.subscription_plan_id,
          status: SUBSCRIPTION_PLAN_STATUS.ACTIVE,
        },
      });

    if (!subscriptionPlan) {
      throw new UnprocessableEntityException('Subscription plan not found');
    }

    const orderCodeSequence = await this.prismaService.$queryRawUnsafe<
      { nextval: number }[]
    >(`SELECT nextval('shared_order_code_seq')`);

    const orderCode = Number(orderCodeSequence[0].nextval);

    const subscriptionOrder = await this.prismaService.subscriptionOrder.create(
      {
        data: {
          user_id: id,
          subscription_plan_id:
            createSubscriptionOrderReqDto.subscription_plan_id,
          status: 'PENDING',
          price: subscriptionPlan.price,
          order_code: orderCode,
        },
      },
    );

    const paymentUrl = await this.payosService.createPaymentUrl({
      amount: subscriptionPlan.price,
      returnUrl: 'http://localhost:3000/subscriptions/order/payment-success',
      cancelUrl: 'Huhu',
      orderCode: Number(orderCode),
      description: `Subscription Order`,
    });

    return {
      ...subscriptionOrder,
      paymentUrl,
    };
  }

  async createSubscription(
    createSubscriptionReqDto: CreateSubscriptionReqDto,
    currentUser: JwtPayloadType,
  ) {
    const { id } = currentUser;
    const user = await this.userService.getUserById(id);
    if (!user || user.role !== USER_ROLE.ADMIN) {
      throw new UnauthorizedException();
    }

    const subscription = await this.prismaService.subscriptionPlan.create({
      data: { ...createSubscriptionReqDto },
    });

    return subscription;
  }

  async getAllSubscriptions() {
    return await this.prismaService.subscriptionPlan.findMany();
  }

  async paymentSuccess({
    paymentLinkId,
    status,
    orderCode,
  }: {
    code: string;
    paymentLinkId: string;
    cancel: boolean;
    status: PAYMENT_STATUS;
    orderCode: number;
  }) {
    const subscriptionOrder =
      await this.prismaService.subscriptionOrder.findFirst({
        where: { order_code: Number(orderCode) },
      });

    if (!subscriptionOrder) {
      throw new UnprocessableEntityException('Order not found');
    }

    if (status === PAYMENT_STATUS.PAID) {
      const updatedSubscriptionOrder =
        await this.prismaService.subscriptionOrder.update({
          where: { id: subscriptionOrder.id },
          data: {
            status: SUBSCRIPTION_ORDER_STATUS.PAID,
          },
        });

      const subscriptionPlan =
        await this.prismaService.subscriptionPlan.findFirst({
          where: { id: updatedSubscriptionOrder.subscription_plan_id },
        });

      const endDate = new Date(
        new Date().setDate(
          new Date().getDate() + (subscriptionPlan?.duration_days || 0),
        ),
      );

      await this.prismaService.user.update({
        where: {
          id: updatedSubscriptionOrder.user_id,
        },
        data: {
          subscription_plan_id: updatedSubscriptionOrder.subscription_plan_id,
          subscription_plan_start_date: new Date(),
          subscription_plan_end_date: endDate,
        },
      });

      const paymentInformation =
        await this.payosService.getPaymentLinkInformation(paymentLinkId);
      console.log(paymentInformation);
      await this.prismaService.transaction.create({
        data: {
          status: paymentInformation.status,
          subscription_order_id: updatedSubscriptionOrder.id,
          ammount: paymentInformation.amount,
          type: 'PAYIN',
        },
      });

      return {
        message: 'Payment successful',
      };
    }
  }
}
