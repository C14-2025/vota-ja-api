import Votes from '~/domain/entities/Vote';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';
import PollNotFoundError from '~/domain/errors/PollNotFoundError';
import PollOptionNotFoundError from '~/domain/errors/PollOptionNotFoundError';
import UserAlreadyVotedError from '~/domain/errors/UserAlreadyVotedError';
import { ICreateVote } from '~/domain/interfaces/dtos/vote/ICreateVote';
import { IVoteRepository } from '~/domain/interfaces/repositories/IVoteRepository';
import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IPollOptionRepository } from '~/domain/interfaces/repositories/IPollOptionRepository';

export default class CreateVoteUseCase {
  constructor(
    private readonly voteRepository: IVoteRepository,
    private readonly userRepository: IUserRepository,
    private readonly pollRepository: IPollRepository,
    private readonly pollOptionRepository: IPollOptionRepository,
  ) {}

  async execute(userId: string, data: ICreateVote): Promise<Votes> {
    // Verifica se o usuário existe
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Verifica se o poll existe
    const poll = await this.pollRepository.getById(data.pollId);
    if (!poll) {
      throw new PollNotFoundError();
    }

    // Verifica se a opção existe
    const option = await this.pollOptionRepository.getById(data.optionId);
    if (!option) {
      throw new PollOptionNotFoundError();
    }

    // Verifica se o usuário já votou neste poll
    const existingVote = await this.voteRepository.findByUserAndPoll(
      userId,
      data.pollId,
    );
    if (existingVote) {
      throw new UserAlreadyVotedError();
    }

    // Cria o voto
    const vote = new Votes({
      voter: user,
      poll: poll,
      option: option,
    });

    return await this.voteRepository.create(vote);
  }
}
