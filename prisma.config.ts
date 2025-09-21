import { defineConfig, PrismaConfig } from 'prisma/config';
import 'dotenv/config';

const prismaConfig: PrismaConfig = {
  schema: './src/database/schema.prisma',
};

export default defineConfig(prismaConfig);
