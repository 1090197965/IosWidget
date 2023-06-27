import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "process";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://10.81.3.113:8888",
    credentials: true,
    allowedHeaders: ['content-type', 'X-Virtual-Env', 'X-Requested-With'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  await app.listen(9000);
}
bootstrap();
