import PollOption from '~/domain/entities/PollOption';

export interface IPollOptionRepository {
  getById(id: string): Promise<PollOption | null>;
}
