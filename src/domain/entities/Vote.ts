import PollTypes from '../enums/PollTypes';
import Poll from './Poll';
import PollOption from './PollOption';
import User from './User';

export default class Votes {
  constructor(props?: Partial<Votes>) {
    Object.assign(this, props);
  }

  voter: User;

  poll: Poll;

  option: PollOption;

  createdAt: Date;

  updatedAt?: Date;
}
