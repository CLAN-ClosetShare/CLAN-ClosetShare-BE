import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import CreateOrderReqDto from './dto/create-order.req.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { Response } from 'express';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async createOrder(
    @Body() createOrderReqDto: CreateOrderReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.orderService.createOrder(currentUser, createOrderReqDto);
  }

  @Get('result')
  async orderSuccess(
    @Query('orderCode') orderCode: string,
    @Query('id') id: string,
    @Query('status') status: 'PAID' | 'CANCELLED',
    @Query('cancel') cancel: boolean,
    @Res() res: Response,
  ) {
    const order = await this.orderService.handleOrderResult({
      orderCode: Number(orderCode),
      id,
      status,
      cancel: Boolean(cancel),
    });

    res.redirect(`http://localhost:6666/order/${order.id}`);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyOrders(
    @CurrentUser() currentUser: JwtPayloadType,
    @Query() query: GetOrdersQueryDto,
  ) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    return await this.orderService.getOrdersByUser({
      userId: currentUser.id,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
    });
  }
}
