import Poll from '~/domain/entities/Poll';
import PollOption from '~/domain/entities/PollOption';
import PollTypes from '~/domain/enums/PollTypes';
import PollNotFoundError from '~/domain/errors/PollNotFoundError';
import UnauthorizedPollAccessError from '~/domain/errors/UnauthorizedPollAccessError';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IVoteRepository } from '~/domain/interfaces/repositories/IVoteRepository';

export interface PollWithVotesCount extends Poll {
  voteCounts: { optionId: string; count: number }[];
  totalVotes: number;
  votedOption: PollOption | null;
}

export default class GetPollByIdUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(pollId: string, userId?: string): Promise<PollWithVotesCount> {
    const poll = await this.pollRepository.getById(pollId);

    if (!poll) {
      throw new PollNotFoundError();
    }

    if (poll.type === PollTypes.PRIVATE && !userId) {
      throw new UnauthorizedPollAccessError();
    }

    const voteCounts = await this.voteRepository.countVotesByPollOption(pollId);
    const totalVotes = voteCounts.reduce((sum, vc) => sum + vc.count, 0);

    let votedOption: PollOption | null = null;
    if (userId) {
      const userVote = await this.voteRepository.findByUserAndPoll(
        userId,
        pollId,
      );
      votedOption = userVote?.option ?? null;
    }

    return {
      ...poll,
      voteCounts,
      totalVotes,
      votedOption,
    };
  }
}
