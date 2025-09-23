import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateProductReqDto, CreateProductVariantReqDto } from './dto';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { PRODUCT_TYPE } from '@prisma/client';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/shop')
  @UseGuards(AuthGuard)
  async createProduct(
    @Query('shopId') shopId: string,
    @Body() createProductReqDto: CreateProductReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.productService.createProduct(
      currentUser,
      shopId,
      createProductReqDto,
    );
  }

  @Get('')
  async getAllProductsByShopId(
    @Query('shopId') shopId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('type') type: PRODUCT_TYPE,
  ) {
    return await this.productService.getAllProductsByShopId({
      shopId,
      page: parseInt(page),
      limit: parseInt(limit),
      search: search,
      type,
    });
  }

  //TODO: add uploading images
  @Post(':productId')
  @UseGuards(AuthGuard)
  async createProductVariant(
    @Param('productId') productId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() createProductVariantReqDto: CreateProductVariantReqDto,
  ) {
    return await this.productService.createProductVariant(
      currentUser,
      productId,
      createProductVariantReqDto,
    );
  }
}
