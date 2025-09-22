import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [AuthModule, UserModule, ShopModule, ProductModule, FileModule],
})
export class ApiModule {}
