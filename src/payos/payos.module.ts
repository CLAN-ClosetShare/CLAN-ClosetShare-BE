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
      provide: 'PayinOS',
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return new PayOS({
          clientId: configService.getOrThrow('payos.payosPayinClientId', {
            infer: true,
          }),
          apiKey: configService.getOrThrow('payos.payosPayinApiKey', {
            infer: true,
          }),
          checksumKey: configService.getOrThrow('payos.payosPayinChecksumKey', {
            infer: true,
          }),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'PayoutOS',
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return new PayOS({
          clientId: configService.getOrThrow('payos.payosPayoutClientId', {
            infer: true,
          }),
          apiKey: configService.getOrThrow('payos.payosPayoutApiKey', {
            infer: true,
          }),
          checksumKey: configService.getOrThrow(
            'payos.payosPayoutChecksumKey',
            {
              infer: true,
            },
          ),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PayosService],
})
export class PayosModule {}
