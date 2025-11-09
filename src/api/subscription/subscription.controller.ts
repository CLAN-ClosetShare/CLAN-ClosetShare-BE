import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateSubscriptionOrderReqDto, CreateSubscriptionReqDto } from './dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { PAYMENT_STATUS } from 'src/payos/constants/payment-status';
import { Response } from 'express';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async createSubscription(
    @Body() createSubscriptionReqDto: CreateSubscriptionReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.subscriptionService.createSubscription(
      createSubscriptionReqDto,
      currentUser,
    );
  }

  @Get('')
  async getAllSubscriptions() {
    return await this.subscriptionService.getAllSubscriptions();
  }

  @Post('order')
  @UseGuards(AuthGuard)
  async createSubscriptionOrder(
    @Body() createSubscriptionOrderReqDto: CreateSubscriptionOrderReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.subscriptionService.createSubscriptionOrder(
      createSubscriptionOrderReqDto,
      currentUser,
    );
  }

  @Get('order/payment-success')
  async paymentSuccess(
    @Query('code') code: string,
    @Query('id') paymentLinkId: string,
    @Query('cancel') cancel: boolean,
    @Query('status') status: PAYMENT_STATUS,
    @Query('orderCode') orderCode: number,
    @Res() res: Response,
  ) {
    await this.subscriptionService.paymentSuccess({
      code,
      paymentLinkId,
      cancel,
      status,
      orderCode,
    });

    res.redirect('https://closetshare.vercel.app/payment/success');
  }
}
