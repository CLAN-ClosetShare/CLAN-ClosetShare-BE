import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { DatabaseConfig } from './database-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidateor {
  @IsString()
  @IsNotEmpty()
  R2_OBJECT_STORAGE_ACCOUNT_ID: string;

  @IsString()
  @IsNotEmpty()
  R2_OBJECT_STORAGE_TOKEN_VALUE: string;

  @IsString()
  @IsNotEmpty()
  R2_OBJECT_STORAGE_BUCKET_NAME: string;

  @IsString()
  @IsNotEmpty()
  R2_OBJECT_STORAGE_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  R2_OBJECT_STORAGE_SECRET_ACCESS_KEY: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  console.info('Register DatabaseConfig from environment variables');
  validateConfig(process.env, EnvironmentVariablesValidateor);

  return {
    r2ObjectStorageAccountId: process.env.R2_OBJECT_STORAGE_ACCOUNT_ID!,
    r2ObjectStorageBucketName: process.env.R2_OBJECT_STORAGE_BUCKET_NAME!,
    r2ObjectStorageTokenValue: process.env.R2_OBJECT_STORAGE_TOKEN_VALUE!,
    r2ObjectStorageAccessKeyId: process.env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
    r2ObjectStorageSecretAccessKey:
      process.env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
  };
});
