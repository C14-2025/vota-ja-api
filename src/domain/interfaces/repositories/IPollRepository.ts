import Poll from '~/domain/entities/Poll';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { IPollResults } from '../dtos/poll/IPollResults';

export interface IPollRepository {
  create(poll: Poll): Promise<Poll>;
  save(poll: Poll): Promise<Poll>;
  getById(id: string): Promise<Poll | null>;
  getResultsById(id: string): Promise<IPollResults>;
  findAll(
    options: IPaginationOptions,
    search?: string,
    userId?: string,
  ): Promise<Pagination<Poll>>;
}
