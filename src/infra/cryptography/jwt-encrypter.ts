import { JwtService } from '@nestjs/jwt';
import { Encrypter } from '~/domain/cryptography/encrypter';

import { config } from '../config';

export default class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      privateKey: config.jwt.privateKey,
      algorithm: 'RS256',
    });
  }
}
