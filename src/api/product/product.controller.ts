import {
  Body,
  Controller,
  Delete,
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
import {
  CreateProductReqDto,
  CreateProductVariantReqDto,
  UpdateProductReqDto,
  UpdateProductVariantReqDto,
} from './dto';
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
    @Body() createProductReqDto: CreateProductReqDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.productService.createProduct(
      currentUser,
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
  async updateProduct(
    @Param('productId') productId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() updateProductReqDto: UpdateProductReqDto,
  ) {
    return await this.productService.updateProduct(
      currentUser,
      productId,
      updateProductReqDto,
    );
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  async deleteProduct(
    @Param('productId') productId: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.productService.deleteProduct(currentUser, productId);
  }

  @Put(':productId/variants/:variantId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async updateProductVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() updateProductVariantReqDto: UpdateProductVariantReqDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return await this.productService.updateProductVariant(
      currentUser,
      productId,
      variantId,
      updateProductVariantReqDto,
      images,
    );
  }

  @Delete(':productId/variants/:variantId')
  @UseGuards(AuthGuard)
  async deleteProductVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    return await this.productService.deleteProductVariant(
      currentUser,
      productId,
      variantId,
    );
  }
}
