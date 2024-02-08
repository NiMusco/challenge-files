import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['content-type', 'Authorization'],
    origin: 'http://localhost:3002',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
