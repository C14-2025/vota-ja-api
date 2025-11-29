import { IPollVoteUpdateEvent } from '../events/IPollVoteUpdateEvent';

export interface IPollRealtimePort {
  publishPollUpdate(pollId: string, data: IPollVoteUpdateEvent): void;
}
