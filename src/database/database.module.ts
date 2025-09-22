import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CloudflareService } from './cloudflare.service';

@Global()
@Module({
  providers: [PrismaService, CloudflareService],
  exports: [PrismaService, CloudflareService],
})
export class DatabaseModule {}
