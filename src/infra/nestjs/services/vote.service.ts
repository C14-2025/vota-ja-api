import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import VoteRepository from '~/infra/databases/typeorm/repositories/vote.repository';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import PollRepository from '~/infra/databases/typeorm/repositories/poll.repository';
import PollOptionRepository from '~/infra/databases/typeorm/repositories/poll-option.repository';
import CreateVoteUseCase from '~/domain/use-cases/vote/create';
import RemoveVoteUseCase from '~/domain/use-cases/vote/remove';
import { ICreateVote } from '~/domain/interfaces/dtos/vote/ICreateVote';
import VoteResponseDTO from '~/infra/dtos/vote/VoteResponseDTO';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';
import PollNotFoundError from '~/domain/errors/PollNotFoundError';
import PollOptionNotFoundError from '~/domain/errors/PollOptionNotFoundError';
import UserAlreadyVotedError from '~/domain/errors/UserAlreadyVotedError';
import VoteNotFoundError from '~/domain/errors/VoteNotFoundError';
import { PollRealtimeAdapter } from '~/infra/websocket/poll-realtime-adapter';

@Injectable()
export default class VoteService {
  createVoteUseCase: CreateVoteUseCase;
  removeVoteUseCase: RemoveVoteUseCase;

  constructor(
    private readonly voteRepository: VoteRepository,
    private readonly userRepository: UserRepository,
    private readonly pollRepository: PollRepository,
    private readonly pollOptionRepository: PollOptionRepository,
    private readonly pollRealtimeAdapter: PollRealtimeAdapter,
  ) {
    this.createVoteUseCase = new CreateVoteUseCase(
      this.voteRepository,
      this.userRepository,
      this.pollRepository,
      this.pollOptionRepository,
      this.pollRealtimeAdapter,
    );

    this.removeVoteUseCase = new RemoveVoteUseCase(
      this.voteRepository,
      this.pollRepository,
      this.pollRealtimeAdapter,
    );
  }

  async createVote(
    userId: string,
    pollId: string,
    payload: ICreateVote,
  ): Promise<VoteResponseDTO> {
    try {
      const voteData = { ...payload, pollId };
      const vote = await this.createVoteUseCase.execute(userId, voteData);

      return {
        voter: {
          id: vote.voter.id,
          name: vote.voter.name,
          email: vote.voter.email,
        },
        poll: {
          id: vote.poll.id,
          title: vote.poll.title,
        },
        option: {
          id: vote.option.id,
          text: vote.option.text,
        },
        createdAt: vote.createdAt,
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof PollNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof PollOptionNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UserAlreadyVotedError) {
        throw new ConflictException(error.message);
      }

      throw new InternalServerErrorException(error);
    }
  }

  async removeVote(userId: string, pollId: string): Promise<void> {
    try {
      await this.removeVoteUseCase.execute(userId, pollId);
    } catch (error) {
      if (error instanceof VoteNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error);
    }
  }
}
