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
import { SubscriptionModule } from './subscription/subscription.module';
import { PostModule } from './post/post.module';
import { ClosetModule } from './closet/closet.module';
import { OutfitModule } from './outfit/outfit.module';
import { ReactModule } from './react/react.module';
import { CommentModule } from './comment/comment.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    AuthModule,
    ClosetModule,
    UserModule,
    ShopModule,
    ProductModule,
    FileModule,
    FilterModule,
    FilterPropModule,
    OutfitModule,
    PlatformModule,
    PostModule,
    OrderModule,
    SubscriptionModule,
    ReactModule,
    CommentModule,
    CartModule,
  ],
})
export class ApiModule {}
