import { Injectable } from '@nestjs/common';
import { CloudflareService } from 'src/database/cloudflare.service';

@Injectable()
export class FileService {
  constructor(private readonly cloudflareService: CloudflareService) {}

  async getSignedUrl(fileName: string): Promise<string> {
    return await this.cloudflareService.getUploadedUrl(fileName);
  }
}
