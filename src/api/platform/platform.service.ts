import { Injectable } from '@nestjs/common';
import { PayoutAccountInfo } from '@payos/node';
import { PayosService } from 'src/payos/payos.service';

@Injectable()
export class PlatformService {
  constructor(private readonly payosService: PayosService) {}

  async getBalance(): Promise<PayoutAccountInfo> {
    return await this.payosService.getBalance();
  }
}
