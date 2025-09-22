import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  PaymentLink,
  PayOS,
} from '@payos/node';
// import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PayosService {
  constructor(
    // private readonly prismaService: PrismaService,
    @Inject('PayOS') private readonly payos: PayOS,
  ) {}

  async createPaymentUrl(
    body: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse> {
    return await this.payos.paymentRequests.create(body);
  }

  async getPaymentLinkInformation(orderId: string): Promise<PaymentLink> {
    return await this.payos.paymentRequests.get(orderId);
  }

  async cancelPaymentLink(orderId: string): Promise<PaymentLink> {
    return await this.payos.paymentRequests.cancel(orderId);
  }
}
