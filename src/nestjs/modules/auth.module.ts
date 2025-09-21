import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../../config';

import LocalStrategy from '../auth/local.strategy';
import JwtStrategy from '../auth/jwt.strategy';
import UserModel from '~/databases/models/User';
import UserRepository from '~/databases/typeorm/repositories/user.repository';
import AuthorizationService from '../services/auth.service';
import AuthController from '../controllers/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      privateKey: config.jwt.privateKey,
      publicKey: config.jwt.publicKey,
      signOptions: {
        expiresIn: config.jwt.expiresIn,
        algorithm: 'RS256',
      },
    }),
    TypeOrmModule.forFeature([UserModel]),
  ],
  controllers: [AuthController],
  providers: [AuthorizationService, UserRepository, LocalStrategy, JwtStrategy],
  exports: [AuthorizationService, JwtStrategy, LocalStrategy],
})
export default class AuthModule {}
