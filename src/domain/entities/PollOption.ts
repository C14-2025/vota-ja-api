export default class PollOption {
  constructor(props?: Partial<PollOption>) {
    Object.assign(this, props);
  }

  id: string;

  text: string;

  createdAt: Date;
}
