import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lookup } from 'mime-types';
import path from 'path';
import { AllConfigType } from 'src/config/config.type';
import { GetUploadedUrlResDto } from './dto';

@Injectable()
export class CloudflareService {
  private readonly s3: S3Client;
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const accountId = this.configService.getOrThrow(
      'database.r2ObjectStorageAccountId',
      {
        infer: true,
      },
    );

    this.s3 = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow(
          'database.r2ObjectStorageAccessKeyId',
          {
            infer: true,
          },
        ),
        secretAccessKey: this.configService.getOrThrow(
          'database.r2ObjectStorageSecretAccessKey',
          {
            infer: true,
          },
        ),
      },
      region: 'auto',
    });
  }

  async getUploadedUrl(fileKey: string): Promise<GetUploadedUrlResDto> {
    const fileExt = path.extname(fileKey);
    const fileName =
      fileKey.replace(fileExt, '').toLowerCase().split(' ').join('-') +
      Date.now() +
      fileExt;
    const contentType = lookup(fileExt) || 'application/octet-stream';
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow(
        'database.r2ObjectStorageBucketName',
        {
          infer: true,
        },
      ),
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return { url, fileKey: fileName };
  }

  async getDownloadedUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow(
        'database.r2ObjectStorageBucketName',
        { infer: true },
      ),
      Key: fileKey,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async getDeleteUrl(fileKey: string): Promise<string> {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow(
        'database.r2ObjectStorageBucketName',
        { infer: true },
      ),
      Key: fileKey,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }
}
