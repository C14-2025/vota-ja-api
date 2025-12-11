import Poll from '~/domain/entities/Poll';
import { PollStatus } from '~/domain/enums/PollStatus';

export default class ValidatePollExpirationUseCase {
  execute(poll: Poll): boolean {
    if (poll.status === PollStatus.CLOSED) {
      return false;
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return false;
    }

    return true;
  }
}
