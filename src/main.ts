import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'graphql', method: RequestMethod.ALL }],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
