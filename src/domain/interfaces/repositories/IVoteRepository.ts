import Votes from '~/domain/entities/Vote';

export interface IVoteRepository {
  create(vote: Votes): Promise<Votes>;
  findByUserAndPoll(userId: string, pollId: string): Promise<Votes | null>;
  countVotesByPollOption(
    pollId: string,
  ): Promise<{ optionId: string; count: number }[]>;
}
