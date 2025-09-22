import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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

  // @Post('upload')
  // async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
  //   return file;
  // }
}
