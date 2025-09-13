import { IUserRepository } from '../types/repositories/IUserRepository';
import IAuthLoginDTO from '../types/dtos/auth/IAuthLoginDTO';
import IAuthResponseDTO from '../types/dtos/auth/IAuthResponseDTO';
import { HashComparer } from '../cryptography/hash-comparer';
import { Encrypter } from '../cryptography/encrypter';
import WrongCredentialsError from '../errors/WrongCredentialsError';

export default class AuthenticateUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      return false;
    }
    return true;
  }

  async execute({ email, password }: IAuthLoginDTO): Promise<IAuthResponseDTO> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new WrongCredentialsError();
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new WrongCredentialsError();
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      email: user.email,
    });

    const { id, email: userEmail } = user;

    return { accessToken, user: { id, email: userEmail } };
  }
}
