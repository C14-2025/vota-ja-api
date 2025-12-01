import Votes from '~/domain/entities/Vote';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';
import PollNotFoundError from '~/domain/errors/PollNotFoundError';
import PollOptionNotFoundError from '~/domain/errors/PollOptionNotFoundError';
import UserAlreadyVotedError from '~/domain/errors/UserAlreadyVotedError';
import PollClosedError from '~/domain/errors/PollClosedError';
import { ICreateVote } from '~/domain/interfaces/dtos/vote/ICreateVote';
import { IVoteRepository } from '~/domain/interfaces/repositories/IVoteRepository';
import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IPollOptionRepository } from '~/domain/interfaces/repositories/IPollOptionRepository';
import { IPollRealtimePort } from '~/domain/ports/IPollRealtimePort';
import { PollStatus } from '~/domain/enums/PollStatus';

export default class CreateVoteUseCase {
  constructor(
    private readonly voteRepository: IVoteRepository,
    private readonly userRepository: IUserRepository,
    private readonly pollRepository: IPollRepository,
    private readonly pollOptionRepository: IPollOptionRepository,
    private readonly pollRealtimePort: IPollRealtimePort,
  ) {}

  async execute(userId: string, data: ICreateVote): Promise<Votes> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const poll = await this.pollRepository.getById(data.pollId);
    if (!poll) {
      throw new PollNotFoundError();
    }

    if (poll.status === PollStatus.CLOSED) {
      throw new PollClosedError();
    }

    const option = await this.pollOptionRepository.getById(data.optionId);
    if (!option) {
      throw new PollOptionNotFoundError();
    }

    const existingVote = await this.voteRepository.findByUserAndPoll(
      userId,
      data.pollId,
    );

    if (existingVote) {
      throw new UserAlreadyVotedError();
    }

    const vote = new Votes({
      voter: user,
      poll,
      option,
    });

    const saveVote = await this.voteRepository.create(vote);

    const pollResults = await this.pollRepository.getResultsById(data.pollId);

    const votedOption = pollResults.options.find(
      opt => opt.optionId === data.optionId,
    );

    if (votedOption) {
      this.pollRealtimePort.publishPollUpdate(data.pollId, {
        pollId: data.pollId,
        optionId: data.optionId,
        totalVotes: pollResults.totalVotes,
        optionVotes: votedOption.voteCount,
        percentage: votedOption.percentage,
      });
    }

    return saveVote;
  }
}
