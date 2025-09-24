import { Controller, Get } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PayoutAccountInfo } from '@payos/node';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  //TODO: secure this endpoint
  @Get('balance')
  async getBalance(): Promise<PayoutAccountInfo> {
    return await this.platformService.getBalance();
  }
}
