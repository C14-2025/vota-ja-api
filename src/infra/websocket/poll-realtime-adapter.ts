import { Injectable } from '@nestjs/common';

import { IPollVoteUpdateEvent } from '~/domain/events/IPollVoteUpdateEvent';
import { PollGateway } from './poll.gateway';
import { IPollRealtimePort } from '~/domain/ports/IPollRealtimePort';

@Injectable()
export class PollRealtimeAdapter implements IPollRealtimePort {
  constructor(private gateway: PollGateway) {}

  publishPollUpdate(pollId: string, data: IPollVoteUpdateEvent) {
    this.gateway.emitPollUpdate(pollId, data);
  }
}
