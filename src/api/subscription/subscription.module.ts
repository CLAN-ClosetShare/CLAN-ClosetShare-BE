import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { UserModule } from '../user/user.module';
import { PayosModule } from 'src/payos/payos.module';

@Module({
  imports: [UserModule, PayosModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
