import Poll from '~/domain/entities/Poll';
import PollOption from '~/domain/entities/PollOption';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';
import { ICreatePoll } from '~/domain/interfaces/dtos/poll/ICreatePoll';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';

export default class CreatePollUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, data: ICreatePoll): Promise<Poll> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const poll = new Poll({
      creator: user,
      description: data.description,
      title: data.title,
      type: data.type,
    });

    const options = data.options.map(
      optionText =>
        new PollOption({
          text: optionText,
        }),
    );

    poll.options = options;

    return this.pollRepository.create(poll);
  }
}
