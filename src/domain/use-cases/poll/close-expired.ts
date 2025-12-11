import { PollStatus } from '~/domain/enums/PollStatus';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';

export default class CloseExpiredPollsUseCase {
  constructor(private readonly pollRepository: IPollRepository) { }

  async execute(): Promise<number> {
    const now = new Date();
    const expiredPolls = await this.pollRepository.findExpiredPolls(now);

    let closedCount = 0;

    for (const poll of expiredPolls) {
      if (poll.status === PollStatus.OPEN) {
        poll.status = PollStatus.CLOSED;
        poll.updatedAt = now;
        await this.pollRepository.update(poll);
        closedCount++;
      }
    }

    return closedCount;
  }
}
