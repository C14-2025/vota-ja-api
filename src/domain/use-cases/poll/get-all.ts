import { IPollRepository } from '~/domain/interfaces/repositories/IPollRepository';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import Poll from '~/domain/entities/Poll';

export default class GetAllPollsUseCase {
  constructor(private pollRepository: IPollRepository) {}

  async execute(options: IPaginationOptions): Promise<Pagination<Poll>> {
    return this.pollRepository.findAll(options);
  }
}
