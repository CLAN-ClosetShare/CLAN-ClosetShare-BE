import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthConfig } from './auth-config.type';
import validateConfig from 'src/utils/validate-config';
import { IsMs } from 'src/decorators/validators/is-ms.decorator';

class EnvironmentVariablesValidateor {
  @IsString()
  @IsNotEmpty()
  AUTH_ACCESS_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_ACCESS_TOKEN_EXPIRATION_TIME: string;

  @IsString()
  @IsNotEmpty()
  AUTH_REFRESH_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_REFRESH_TOKEN_EXPIRATION_TIME: string;
}

export default registerAs<AuthConfig>('auth', () => {
  console.info('Register AuthConfig from environment variables');
  validateConfig(process.env, EnvironmentVariablesValidateor);

  return {
    accessTokenSecret: process.env.AUTH_ACCESS_TOKEN_SECRET!,
    accessTokenExpirationTime: process.env.AUTH_ACCESS_TOKEN_EXPIRATION_TIME!,
    refreshTokenSecret: process.env.AUTH_REFRESH_TOKEN_SECRET!,
    refreshTokenExpirationTime: process.env.AUTH_REFRESH_TOKEN_EXPIRATION_TIME!,
  };
});
