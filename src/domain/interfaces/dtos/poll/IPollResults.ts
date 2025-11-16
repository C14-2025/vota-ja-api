export interface IPollOptionResult {
  optionId: string;
  optionText: string;
  voteCount: number;
  percentage: number;
}

export interface IPollResults {
  pollId: string;
  title: string;
  description: string;
  totalVotes: number;
  options: IPollOptionResult[];
}
