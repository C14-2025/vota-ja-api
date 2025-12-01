import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { config } from '~/infra/config';

import { WinstonModule } from 'nest-winston';
import winstonConfig from '~/infra/config/winston.config';
import { PollGateway } from '~/infra/websocket/poll.gateway';
import { PollRealtimeAdapter } from '~/infra/websocket/poll-realtime-adapter';
import AuthModule from './auth.module';
import UserModule from './user.module';
import PollModule from './poll.module';
import VoteModule from './vote.module';
import TypeOrmModuleConfig from '../../databases/typeorm';
import LoggerInterceptor from '../interceptors/logger.interceptor';
import AllExceptionsFilter from '../exceptions/all-exceptions-filter';
import AppController from '../controllers/app.controller';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRoot([
      { ttl: config.rateLimit.ttl, limit: config.rateLimit.limit },
    ]),
    TypeOrmModuleConfig,
    AuthModule,
    UserModule,
    PollModule,
    VoteModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    PollGateway,
    PollRealtimeAdapter,
  ],
})
export default class AppModule {}
