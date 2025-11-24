import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors();

  const port = 3000;
  await app.listen(port);
  
  Logger.log(`🦁 SkyMind API rodando na porta ${port}`, 'Bootstrap');
}
bootstrap();