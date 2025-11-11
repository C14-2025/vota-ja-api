import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import BcryptHasher from '~/infra/cryptography/bcrypt-hasher';
import JwtEncrypter from '~/infra/cryptography/jwt-encrypter';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import WrongCredentialsError from '~/domain/errors/WrongCredentialsError';
import AuthenticateUseCase from '~/domain/services/auth.service';
import AuthLoginDTO from '~/infra/dtos/auth/AuthLoginDTO';
import AuthResponseDTO from '~/infra/dtos/auth/AuthResponseDTO';

@Injectable()
export default class AuthorizationService {
  useCase: AuthenticateUseCase;

  constructor(
    private jwtTokenService: JwtService,
    private readonly userRepository: UserRepository,
  ) {
    this.useCase = new AuthenticateUseCase(
      this.userRepository,
      new BcryptHasher(),
      new JwtEncrypter(this.jwtTokenService),
    );
  }

  async validateUser(email: string, password: string): Promise<boolean> {
    return this.useCase.validateUser(email, password);
  }

  async login(login: AuthLoginDTO): Promise<AuthResponseDTO> {
    try {
      return await this.useCase.execute(login);
    } catch (error) {
      if (error instanceof WrongCredentialsError)
        throw new BadRequestException(error);

      throw new InternalServerErrorException(error);
    }
  }
}
