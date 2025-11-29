import Poll from '~/domain/entities/Poll';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

export interface IPollRepository {
  create(poll: Poll): Promise<Poll>;
  getById(id: string): Promise<Poll | null>;
  findAll(
    options: IPaginationOptions,
    search?: string,
  ): Promise<Pagination<Poll>>;
}
