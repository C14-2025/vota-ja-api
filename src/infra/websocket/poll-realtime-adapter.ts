import { Injectable } from '@nestjs/common';

import { IPollVoteUpdateEvent } from '~/domain/events/IPollVoteUpdateEvent';
import { IPollRealtimePort } from '~/domain/ports/IPollRealtimePort';
import { PollGateway } from './poll.gateway';

@Injectable()
export class PollRealtimeAdapter implements IPollRealtimePort {
  constructor(private gateway: PollGateway) {}

  publishPollUpdate(pollId: string, data: IPollVoteUpdateEvent) {
    this.gateway.emitPollUpdate(pollId, data);
  }
}
