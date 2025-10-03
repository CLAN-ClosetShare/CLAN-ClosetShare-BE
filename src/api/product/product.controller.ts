import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateProductReqDto, CreateProductVariantReqDto } from './dto';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { PRODUCT_TYPE } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

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

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    return await this.productService.getProductById(productId);
  }

  //TODO: add uploading images
  @Post(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images')) // Accept multiple files under the 'images' field
  async createProductVariant(
    @Param('productId') productId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() createProductVariantReqDto: CreateProductVariantReqDto,
    @UploadedFiles() images: Express.Multer.File[], // Uploaded files will be available here
  ) {
    // Delegate all logic to the ProductService
    return await this.productService.createProductVariant(
      currentUser,
      productId,
      createProductVariantReqDto,
      images, // Pass the uploaded files directly to the service
    );
  }

  @Put(':productId')
  @UseGuards(AuthGuard)
  async updateProduct() {}
}
