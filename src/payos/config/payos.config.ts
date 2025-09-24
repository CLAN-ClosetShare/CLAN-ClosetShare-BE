import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { PayosConfig } from './payos-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidateor {
  @IsString()
  @IsNotEmpty()
  PAYOS_PAYIN_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_PAYIN_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_PAYIN_CHECKSUM_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_PAYOUT_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_PAYOUT_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_PAYOUT_CHECKSUM_KEY: string;
}

export default registerAs<PayosConfig>('payos', () => {
  console.info('Register PayosConfig from environment variables');
  validateConfig(process.env, EnvironmentVariablesValidateor);

  return {
    payosPayinClientId: process.env.PAYOS_PAYIN_CLIENT_ID!,
    payosPayinApiKey: process.env.PAYOS_PAYIN_API_KEY!,
    payosPayinChecksumKey: process.env.PAYOS_PAYIN_CHECKSUM_KEY!,
    payosPayoutClientId: process.env.PAYOS_PAYOUT_CLIENT_ID!,
    payosPayoutApiKey: process.env.PAYOS_PAYOUT_API_KEY!,
    payosPayoutChecksumKey: process.env.PAYOS_PAYOUT_CHECKSUM_KEY!,
  };
});
