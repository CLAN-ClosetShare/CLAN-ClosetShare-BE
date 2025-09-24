import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  PaymentLink,
  PayOS,
  PayoutAccountInfo,
} from '@payos/node';

@Injectable()
export class PayosService {
  constructor(
    // private readonly prismaService: PrismaService,
    @Inject('PayinOS') private readonly payinOS: PayOS,
    @Inject('PayoutOS') private readonly payoutOS: PayOS,
  ) {}

  async createPaymentUrl(
    body: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse> {
    return await this.payinOS.paymentRequests.create(body);
  }

  async getPaymentLinkInformation(orderId: string): Promise<PaymentLink> {
    return await this.payinOS.paymentRequests.get(orderId);
  }

  async cancelPaymentLink(orderId: string): Promise<PaymentLink> {
    return await this.payinOS.paymentRequests.cancel(orderId);
  }

  async getBalance(): Promise<PayoutAccountInfo> {
    return await this.payoutOS.payoutsAccount.balance();
  }
}
