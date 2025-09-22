import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { PayosConfig } from './payos-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidateor {
  @IsString()
  @IsNotEmpty()
  PAYOS_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYOS_CHECKSUM_KEY: string;
}

export default registerAs<PayosConfig>('payos', () => {
  console.info('Register PayosConfig from environment variables');
  validateConfig(process.env, EnvironmentVariablesValidateor);

  return {
    payosClientId: process.env.PAYOS_CLIENT_ID!,
    payosApiKey: process.env.PAYOS_API_KEY!,
    payosChecksumKey: process.env.PAYOS_CHECKSUM_KEY!,
  };
});
