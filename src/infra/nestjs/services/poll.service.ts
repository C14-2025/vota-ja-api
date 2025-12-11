import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
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
import ClosePollUseCase from '~/domain/use-cases/poll/close-poll';
import { PollStatus } from '~/domain/enums/PollStatus';

@Injectable()
export default class PollService {
  createPollUseCase: CreatePollUseCase;

  getPollByIdUseCase: GetPollByIdUseCase;

  getAllPollsUseCase: GetAllPollsUseCase;

  closePollUseCase: ClosePollUseCase;

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
    this.closePollUseCase = new ClosePollUseCase(this.pollRepository);
  }

  private async checkAndCloseExpiredPoll(poll: any): Promise<any> {
    if (
      poll &&
      poll.expiresAt &&
      new Date() > new Date(poll.expiresAt) &&
      poll.status === PollStatus.OPEN
    ) {
      try {
        poll.status = PollStatus.CLOSED;
        poll.updatedAt = new Date();
        await this.pollRepository.save(poll);
      } catch (error) {
        console.error('Error closing expired poll:', error);
      }
    }
    return poll;
  }

  private async checkAndCloseExpiredPolls(polls: any[]): Promise<any[]> {
    for (const poll of polls) {
      await this.checkAndCloseExpiredPoll(poll);
    }
    return polls;
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

  async closePoll(pollId: string, userId: string): Promise<void> {
    try {
      return await this.closePollUseCase.execute(pollId, userId);
    } catch (error) {
      if (error instanceof PollNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UnauthorizedPollAccessError) {
        throw new ForbiddenException(error.message);
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

      await this.checkAndCloseExpiredPoll(pollWithVotes);

      // Criar um mapa de contagem de votos por optionId
      const voteCountMap = new Map(
        pollWithVotes.voteCounts.map(vc => [vc.optionId, vc.count]),
      );

      return {
        id: pollWithVotes.id,
        title: pollWithVotes.title,
        description: pollWithVotes.description,
        type: pollWithVotes.type,
        status: pollWithVotes.status,
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
        expiresAt: pollWithVotes.expiresAt,
        votedOption: pollWithVotes.votedOption,
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
    userId?: string,
  ): Promise<Pagination<Poll>> {
    try {
      const result = await this.getAllPollsUseCase.execute(options, search, userId);

      // Verificar e fechar polls expiradas
      if (result.items && result.items.length > 0) {
        await this.checkAndCloseExpiredPolls(result.items);
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
