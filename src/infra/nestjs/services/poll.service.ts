import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import PollRepository from '~/infra/databases/typeorm/repositories/poll.repository';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import CreatePollUseCase from '~/domain/use-cases/poll/create';
import { ICreatePoll } from '~/domain/interfaces/dtos/poll/ICreatePoll';
import PollResponseDTO from '~/infra/dtos/poll/PollResponseDTO';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';

@Injectable()
export default class PollService {
  createPollUseCase: CreatePollUseCase;

  constructor(
    private readonly pollRepository: PollRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.createPollUseCase = new CreatePollUseCase(
      this.pollRepository,
      this.userRepository,
    );
  }

  async createPoll(
    userId: string,
    payload: ICreatePoll,
  ): Promise<PollResponseDTO> {
    try {
      return await this.createPollUseCase.execute(userId, payload);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error);
    }
  }
}
