export interface IPollVoteUpdateEvent {
  pollId: string;
  optionId: string;
  totalVotes: number;
  optionVotes: number;
  percentage: number;
}
