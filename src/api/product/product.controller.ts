import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateProductReqDto } from './dto';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post(':shopId')
  @UseGuards(AuthGuard)
  async createProduct(
    @Param('shopId') shopId: string,
    @Body() createProductReqDto: CreateProductReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.productService.createProduct(
      currentUser,
      shopId,
      createProductReqDto,
    );
  }

  //TODO: add pagination
  @Get(':shopId')
  async getAllProductsByShopId(@Param('shopId') shopId: string) {
    return await this.productService.getAllProductsByShopId(shopId);
  }
}
