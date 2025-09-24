import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import CreateOrderReqDto from './dto/create-order.req.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

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
}
