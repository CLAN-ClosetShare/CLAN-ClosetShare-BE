import { Controller } from '@nestjs/common';

@Controller('products')
export class ProductController {
  constructor() {} // private readonly productService: ProductService,

  // @Post(':shopId')
  // @UseGuards(AuthGuard)
  // async createProduct(
  //   @Param('shopId') shopId: string,
  //   @Body() createProductReqDto: CreateProductReqDto,
  // ) {
  //   return 'ahihi';
  // }

  // @Post('upload')
  // async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
  //   return file;
  // }
}
