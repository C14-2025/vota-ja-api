import { Module } from '@nestjs/common';
import AppController from '../exceptions/controllers/app.controller';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { config } from '~/infra/config';

import { WinstonModule } from 'nest-winston';
import winstonConfig from '~/infra/config/winston.config';
import AuthModule from './auth.module';
import UserModule from './user.module';
import TypeOrmModuleConfig from '../../databases/typeorm';
import LoggerInterceptor from '../interceptors/logger.interceptor';
import AllExceptionsFilter from '../exceptions/all-exceptions-filter';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRoot([
      { ttl: config.rateLimit.ttl, limit: config.rateLimit.limit },
    ]),
    TypeOrmModuleConfig,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export default class AppModule {}
