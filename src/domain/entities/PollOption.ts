import PollTypes from '../enums/PollTypes';
import Poll from './Poll';
import User from './User';

export default class PollOption {
  constructor(props?: Partial<PollOption>) {
    Object.assign(this, props);
  }

  id: string;

  text: string;

  createdAt: Date;
}
