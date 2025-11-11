import Poll from '~/domain/entities/Poll';

export interface IPollRepository {
  create(poll: Poll): Promise<Poll>;
}
