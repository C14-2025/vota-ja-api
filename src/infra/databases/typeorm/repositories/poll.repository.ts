import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

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

  async getById(id: string): Promise<Poll | null> {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['options', 'creator'],
    });

    if (poll == null) {
      return null;
    }

    return poll;
  }

  async findAll(
    options: IPaginationOptions,
    search?: string,
  ): Promise<Pagination<Poll>> {
    const queryBuilder = this.pollRepository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.creator', 'creator')
      .leftJoinAndSelect('poll.options', 'options')
      .orderBy('poll.createdAt', 'DESC');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        `(poll.title ILIKE :search OR poll.description ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    return paginate<Poll>(queryBuilder, options);
  }
}
