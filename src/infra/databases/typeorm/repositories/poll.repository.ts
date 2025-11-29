import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

import Poll from '~/domain/entities/Poll';
import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IPollResults } from '~/domain/interfaces/dtos/poll/IPollResults';
import PollModel from '../../models/Poll';
import VoteModel from '../../models/Vote';

@Injectable()
export default class PollRepository implements IPollRepository {
  constructor(
    @InjectRepository(PollModel)
    private readonly pollRepository: Repository<PollModel>,
    @InjectRepository(VoteModel)
    private readonly voteRepository: Repository<VoteModel>,
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

  async getResultsById(id: string): Promise<IPollResults> {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    const voteCounts = await this.voteRepository
      .createQueryBuilder('vote')
      .select('vote.optionId', 'optionId')
      .addSelect('COUNT(*)', 'count')
      .where('vote.pollId = :pollId', { pollId: id })
      .groupBy('vote.optionId')
      .getRawMany();

    const voteCountMap = new Map<string, number>();
    let totalVotes = 0;

    voteCounts.forEach(row => {
      const count = parseInt(row.count, 10);
      voteCountMap.set(row.optionId, count);
      totalVotes += count;
    });

    const options = poll.options.map(option => {
      const voteCount = voteCountMap.get(option.id) || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

      return {
        optionId: option.id,
        optionText: option.text,
        voteCount,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    return {
      pollId: poll.id,
      title: poll.title,
      description: poll.description,
      totalVotes,
      options,
    };
  }

  async findAll(
    options: IPaginationOptions,
    search?: string,
    userId?: string,
  ): Promise<Pagination<Poll>> {
    const queryBuilder = this.pollRepository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.creator', 'creator')
      .orderBy('poll.createdAt', 'DESC');

    if (!userId) {
      queryBuilder.andWhere('poll.type = :type', { type: 'public' });
    }

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        `(poll.title ILIKE :search OR poll.description ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const paginatedResult = await paginate<Poll>(queryBuilder, options);

    if (paginatedResult.items.length > 0) {
      const pollIds = paginatedResult.items.map(poll => poll.id);
      const pollsWithOptions = await this.pollRepository.find({
        where: { id: In(pollIds) },
        relations: ['options'],
      });

      const optionsMap = new Map(
        pollsWithOptions.map(poll => [poll.id, poll.options]),
      );

      paginatedResult.items.forEach(poll => {
        poll.options = optionsMap.get(poll.id) || [];
      });
    }

    return paginatedResult;
  }
}
