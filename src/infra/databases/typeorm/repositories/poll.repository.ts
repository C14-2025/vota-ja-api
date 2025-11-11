import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Poll from '~/domain/entities/Poll';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import PollModel from '../../models/Poll';

@Injectable()
export default class PollRepository implements IPollRepository {
  constructor(
    @InjectRepository(PollModel)
    private readonly pollRepository: Repository<PollModel>,
  ) {}

  async create(poll: Poll): Promise<Poll> {
    const savedPollModel = await this.pollRepository.save(poll);
    return savedPollModel;
  }
}
