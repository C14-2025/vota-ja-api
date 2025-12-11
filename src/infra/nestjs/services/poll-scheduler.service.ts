import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import CloseExpiredPollsUseCase from '~/domain/use-cases/poll/close-expired';

@Injectable()
export default class PollSchedulerService {
  private readonly logger = new Logger(PollSchedulerService.name);

  constructor(
    private readonly closeExpiredPollsUseCase: CloseExpiredPollsUseCase,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkExpiredPolls() {
    try {
      this.logger.debug('Checking for expired polls...');
      const closedCount = await this.closeExpiredPollsUseCase.execute();

      if (closedCount > 0) {
        this.logger.log(`Closed ${closedCount} expired poll(s)`);
      } else {
        this.logger.debug('No expired polls found');
      }
    } catch (error) {
      this.logger.error('Error checking expired polls:', error);
    }
  }
}
