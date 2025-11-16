import VoteNotFoundError from '~/domain/errors/VoteNotFoundError';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IVoteRepository } from '~/domain/interfaces/repositories/IVoteRepository';
import { IPollRealtimePort } from '~/domain/ports/IPollRealtimePort';

export default class RemoveVoteUseCase {
  constructor(
    private readonly voteRepository: IVoteRepository,
    private readonly pollRepository: IPollRepository,
    private readonly pollRealtimePort: IPollRealtimePort,
  ) {}

  async execute(userId: string, pollId: string): Promise<void> {
    const existingVote = await this.voteRepository.findByUserAndPoll(
      userId,
      pollId,
    );

    if (!existingVote) {
      throw new VoteNotFoundError();
    }

    await this.voteRepository.delete(userId, pollId);

    const pollResults = await this.pollRepository.getResultsById(pollId);

    const votedOption = pollResults.options.find(
      opt => opt.optionId === existingVote.option.id,
    );

    if (votedOption) {
      this.pollRealtimePort.publishPollUpdate(pollId, {
        pollId: pollId,
        optionId: existingVote.option.id,
        totalVotes: pollResults.totalVotes,
        optionVotes: votedOption.voteCount,
        percentage: votedOption.percentage,
      });
    }
  }
}
