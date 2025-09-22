import { Controller, Get, Query } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('presign')
  async getPresignedUrl(@Query('fileName') fileName: string) {
    return await this.fileService.getSignedUrl(fileName);
  }
}
