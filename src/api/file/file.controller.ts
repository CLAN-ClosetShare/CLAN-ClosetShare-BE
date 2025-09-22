import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('presign')
  @UseGuards(AuthGuard)
  async getPresignedUrl(@Query('fileName') fileName: string) {
    return await this.fileService.getSignedUrl(fileName);
  }
}
