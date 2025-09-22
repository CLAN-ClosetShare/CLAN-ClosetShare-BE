import { Module } from '@nestjs/common';
import { PayosController } from './payos.controller';
import { PayosService } from './payos.service';
import { PayOS } from '@payos/node';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Module({
  imports: [ConfigModule],
  controllers: [PayosController],
  providers: [
    PayosService,
    {
      provide: 'PayOS',
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return new PayOS({
          clientId: configService.getOrThrow('payos.payosClientId', {
            infer: true,
          }),
          apiKey: configService.getOrThrow('payos.payosApiKey', {
            infer: true,
          }),
          checksumKey: configService.getOrThrow('payos.payosChecksumKey', {
            infer: true,
          }),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class PayosModule {}
