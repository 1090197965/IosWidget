import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "process";
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置请求体大小限制为 50MB
  app.use(json({ limit: '50mb' }));
  
  app.enableCors({
    origin: ['http://localhost:8888', 'http://10.81.3.113:8888', 'https://nas.qppp.top:22432'],
    credentials: true,
    allowedHeaders: ['content-type', 'X-Virtual-Env', 'X-Requested-With'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  await app.listen(9000);
}
bootstrap();
