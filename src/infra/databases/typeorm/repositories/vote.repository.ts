import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Votes from '~/domain/entities/Vote';
import { IVoteRepository } from '~/domain/interfaces/repositories/IVoteRepository';
import VoteModel from '../../models/Vote';

@Injectable()
export default class VoteRepository implements IVoteRepository {
  constructor(
    @InjectRepository(VoteModel)
    private readonly voteRepository: Repository<VoteModel>,
  ) {}

  async create(vote: Votes): Promise<Votes> {
    const savedVoteModel = await this.voteRepository.save(vote);
    return savedVoteModel;
  }

  async findByUserAndPoll(
    userId: string,
    pollId: string,
  ): Promise<Votes | null> {
    const vote = await this.voteRepository.findOne({
      where: {
        voterId: userId,
        pollId: pollId,
      },
      relations: ['voter', 'poll', 'option'],
    });

    if (vote == null) {
      return null;
    }

    return vote;
  }
}
