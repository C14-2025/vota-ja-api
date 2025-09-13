import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { config } from 'config';
import Environment from 'types/Environment';
import winstonConfig from 'config/winston.config';
import AppModule from 'nestjs/modules/app.module';
import setSwagger from 'swagger';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' });

  if (config.app.environment !== Environment.PRD) {
    setSwagger(app, config.swagger);
  }

  await app.listen(5000);
}

bootstrap();
