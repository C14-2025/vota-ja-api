import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import PollOption from '~/domain/entities/PollOption';
import { IPollOptionRepository } from '~/domain/interfaces/repositories/IPollOptionRepository';
import PollOptionModel from '../../models/PollOption';

@Injectable()
export default class PollOptionRepository implements IPollOptionRepository {
  constructor(
    @InjectRepository(PollOptionModel)
    private readonly pollOptionRepository: Repository<PollOptionModel>,
  ) {}

  async getById(id: string): Promise<PollOption | null> {
    const option = await this.pollOptionRepository.findOne({
      where: { id },
      relations: ['poll'],
    });

    if (option == null) {
      return null;
    }

    return option;
  }
}
