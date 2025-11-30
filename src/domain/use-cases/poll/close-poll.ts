import { PollStatus } from '~/domain/enums/PollStatus';
import PollNotFoundError from '~/domain/errors/PollNotFoundError';
import UnauthorizedPollAccessError from '~/domain/errors/UnauthorizedPollAccessError';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';

export default class ClosePollUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(pollId: string, userId: string) {
    const poll = await this.pollRepository.getById(pollId);

    if (!poll) {
      throw new PollNotFoundError();
    }

    if (poll.creator.id !== userId) {
      throw new UnauthorizedPollAccessError();
    }

    poll.status = PollStatus.CLOSED;
    await this.pollRepository.save(poll);
  }
}
