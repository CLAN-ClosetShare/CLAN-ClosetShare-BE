import { Injectable } from '@nestjs/common';
import { CloudflareService } from 'src/database/cloudflare.service';
import { GetUploadedUrlResDto } from 'src/database/dto';

@Injectable()
export class FileService {
  constructor(private readonly cloudflareService: CloudflareService) {}

  async getSignedUrl(fileName: string): Promise<GetUploadedUrlResDto> {
    return await this.cloudflareService.getUploadedUrl(fileName);
  }
}
