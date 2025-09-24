import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { FileModule } from './file/file.module';
import { FilterModule } from './filter/filter.module';
import { FilterPropModule } from './filterProp/filter-prop.module';
import { PlatformModule } from './platform/platform.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ShopModule,
    ProductModule,
    FileModule,
    FilterModule,
    FilterPropModule,
    PlatformModule,
    OrderModule,
  ],
})
export class ApiModule {}
