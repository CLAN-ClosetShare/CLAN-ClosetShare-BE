import { AuthConfig } from 'src/api/auth/config/auth-config.type';
import { DatabaseConfig } from 'src/database/config/database-config.type';
import { PayosConfig } from 'src/payos/config/payos-config.type';

export type AllConfigType = {
  auth: AuthConfig;
  database: DatabaseConfig;
  payos: PayosConfig;
};
