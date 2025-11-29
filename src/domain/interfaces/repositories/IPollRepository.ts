import Poll from '~/domain/entities/Poll';
import { IPollResults } from '../dtos/poll/IPollResults';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

export interface IPollRepository {
  create(poll: Poll): Promise<Poll>;
  getById(id: string): Promise<Poll | null>;
  getResultsById(id: string): Promise<IPollResults>;
  findAll(
    options: IPaginationOptions,
    search?: string,
  ): Promise<Pagination<Poll>>;
}
