import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('')
  async getCart(@CurrentUser() currentUser: JwtPayloadType) {
    return await this.cartService.getCart(currentUser.id);
  }

  @Post('items')
  async addItem(
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return await this.cartService.addItem(currentUser.id, addCartItemDto);
  }

  @Patch('items/:itemId')
  async updateItem(
    @CurrentUser() currentUser: JwtPayloadType,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateItem(
      currentUser.id,
      itemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:itemId')
  async removeItem(
    @CurrentUser() currentUser: JwtPayloadType,
    @Param('itemId') itemId: string,
  ) {
    return await this.cartService.removeItem(currentUser.id, itemId);
  }

  @Delete('')
  async clearCart(@CurrentUser() currentUser: JwtPayloadType) {
    return await this.cartService.clearCart(currentUser.id);
  }
}
