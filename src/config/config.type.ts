import { AuthConfig } from 'src/api/auth/config/auth-config.type';
import { DatabaseConfig } from 'src/database/config/database-config.type';

export type AllConfigType = {
  auth: AuthConfig;
  database: DatabaseConfig;
};
