import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './utils/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limits to support base64-encoded payloads
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  app.enableCors({
    origin: '*',
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
