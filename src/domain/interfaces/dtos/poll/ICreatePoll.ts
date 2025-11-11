import PollTypes from '~/domain/enums/PollTypes';

export interface ICreatePoll {
  title: string;
  description: string;
  type: PollTypes;
  options: string[];
}
