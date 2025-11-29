import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import PollRepository from '~/infra/databases/typeorm/repositories/poll.repository';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import VoteRepository from '~/infra/databases/typeorm/repositories/vote.repository';
import CreatePollUseCase from '~/domain/use-cases/poll/create';
import GetPollByIdUseCase from '~/domain/use-cases/poll/get-by-id';
import GetAllPollsUseCase from '~/domain/use-cases/poll/get-all';
import { ICreatePoll } from '~/domain/interfaces/dtos/poll/ICreatePoll';
import PollResponseDTO from '~/infra/dtos/poll/PollResponseDTO';
import PollWithVotesResponseDTO from '~/infra/dtos/poll/PollWithVotesResponseDTO';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';
import PollNotFoundError from '~/domain/errors/PollNotFoundError';
import UnauthorizedPollAccessError from '~/domain/errors/UnauthorizedPollAccessError';
import Poll from '~/domain/entities/Poll';

@Injectable()
export default class PollService {
  createPollUseCase: CreatePollUseCase;
  getPollByIdUseCase: GetPollByIdUseCase;
  getAllPollsUseCase: GetAllPollsUseCase;

  constructor(
    private readonly pollRepository: PollRepository,
    private readonly userRepository: UserRepository,
    private readonly voteRepository: VoteRepository,
  ) {
    this.createPollUseCase = new CreatePollUseCase(
      this.pollRepository,
      this.userRepository,
    );
    this.getPollByIdUseCase = new GetPollByIdUseCase(
      this.pollRepository,
      this.voteRepository,
    );
    this.getAllPollsUseCase = new GetAllPollsUseCase(this.pollRepository);
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

  async getPollById(
    pollId: string,
    userId?: string,
  ): Promise<PollWithVotesResponseDTO> {
    try {
      const pollWithVotes = await this.getPollByIdUseCase.execute(
        pollId,
        userId,
      );

      // Criar um mapa de contagem de votos por optionId
      const voteCountMap = new Map(
        pollWithVotes.voteCounts.map(vc => [vc.optionId, vc.count]),
      );

      return {
        id: pollWithVotes.id,
        title: pollWithVotes.title,
        description: pollWithVotes.description,
        type: pollWithVotes.type,
        options: pollWithVotes.options.map(option => ({
          id: option.id,
          text: option.text,
          votesCount: voteCountMap.get(option.id) || 0,
          createdAt: option.createdAt,
        })),
        creator: {
          id: pollWithVotes.creator.id,
          name: pollWithVotes.creator.name,
          email: pollWithVotes.creator.email,
          createdAt: pollWithVotes.creator.createdAt,
          lastLogin: pollWithVotes.creator.lastLogin,
          updatedAt: pollWithVotes.creator.updatedAt,
        },
        totalVotes: pollWithVotes.totalVotes,
        createdAt: pollWithVotes.createdAt,
        updatedAt: pollWithVotes.updatedAt,
      };
    } catch (error) {
      if (error instanceof PollNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UnauthorizedPollAccessError) {
        throw new UnauthorizedException(error.message);
      }

      throw new InternalServerErrorException(error);
    }
  }

  async getAllPolls(
    options: IPaginationOptions,
    search?: string,
  ): Promise<Pagination<Poll>> {
    try {
      return await this.getAllPollsUseCase.execute(options, search);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
