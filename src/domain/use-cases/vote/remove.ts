import VoteNotFoundError from '~/domain/errors/VoteNotFoundError';
import { IVoteRepository } from '~/domain/interfaces/repositories/IVoteRepository';

export default class RemoveVoteUseCase {
  constructor(private readonly voteRepository: IVoteRepository) {}

  async execute(userId: string, pollId: string): Promise<void> {
    const existingVote = await this.voteRepository.findByUserAndPoll(
      userId,
      pollId,
    );

    if (!existingVote) {
      throw new VoteNotFoundError();
    }

    await this.voteRepository.delete(userId, pollId);
  }
}
