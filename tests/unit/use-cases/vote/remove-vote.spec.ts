import RemoveVoteUseCase from '../../../../src/domain/use-cases/vote/remove';
import { IVoteRepository } from '../../../../src/domain/interfaces/repositories/IVoteRepository';
import VoteNotFoundError from '../../../../src/domain/errors/VoteNotFoundError';
import Votes from '../../../../src/domain/entities/Vote';
import User from '../../../../src/domain/entities/User';
import Poll from '../../../../src/domain/entities/Poll';
import PollOption from '../../../../src/domain/entities/PollOption';

describe('RemoveVoteUseCase', () => {
  let removeVoteUseCase: RemoveVoteUseCase;
  let voteRepository: jest.Mocked<IVoteRepository>;

  beforeEach(() => {
    voteRepository = {
      create: jest.fn(),
      findByUserAndPoll: jest.fn(),
      countVotesByPollOption: jest.fn(),
      delete: jest.fn(),
    };

    removeVoteUseCase = new RemoveVoteUseCase(voteRepository);
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const pollId = '987e6543-e21b-34d5-b678-123456789abc';

    const mockUser: User = {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      lastLogin: undefined,
    };

    const mockPoll = new Poll({
      id: pollId,
      title: 'Favorite Programming Language',
      description: 'Vote for your favorite language',
      creator: mockUser,
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
    });

    const mockOption = new PollOption({
      id: 'option-123',
      text: 'TypeScript',
      poll: mockPoll,
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
    });

    const mockVote: Votes = {
      voter: mockUser,
      poll: mockPoll,
      option: mockOption,
      createdAt: new Date('2023-10-15T10:00:00.000Z'),
      updatedAt: new Date('2023-10-15T10:00:00.000Z'),
    };

    it('should remove a vote successfully when vote exists', async () => {
      voteRepository.findByUserAndPoll.mockResolvedValue(mockVote);
      voteRepository.delete.mockResolvedValue(undefined);

      await removeVoteUseCase.execute(userId, pollId);

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        userId,
        pollId,
      );
      expect(voteRepository.delete).toHaveBeenCalledTimes(1);
      expect(voteRepository.delete).toHaveBeenCalledWith(userId, pollId);
    });

    it('should throw VoteNotFoundError when vote does not exist', async () => {
      voteRepository.findByUserAndPoll.mockResolvedValue(null);

      await expect(removeVoteUseCase.execute(userId, pollId)).rejects.toThrow(
        VoteNotFoundError,
      );

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        userId,
        pollId,
      );
      expect(voteRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw VoteNotFoundError with correct message', async () => {
      voteRepository.findByUserAndPoll.mockResolvedValue(null);

      await expect(removeVoteUseCase.execute(userId, pollId)).rejects.toThrow(
        'Vote not found',
      );
    });

    it('should propagate repository errors from findByUserAndPoll', async () => {
      const error = new Error('Database connection error');
      voteRepository.findByUserAndPoll.mockRejectedValue(error);

      await expect(removeVoteUseCase.execute(userId, pollId)).rejects.toThrow(
        'Database connection error',
      );

      expect(voteRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors from delete', async () => {
      const error = new Error('Failed to delete vote');
      voteRepository.findByUserAndPoll.mockResolvedValue(mockVote);
      voteRepository.delete.mockRejectedValue(error);

      await expect(removeVoteUseCase.execute(userId, pollId)).rejects.toThrow(
        'Failed to delete vote',
      );

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle different user and poll IDs', async () => {
      const differentUserId = 'different-user-id';
      const differentPollId = 'different-poll-id';

      voteRepository.findByUserAndPoll.mockResolvedValue(mockVote);
      voteRepository.delete.mockResolvedValue(undefined);

      await removeVoteUseCase.execute(differentUserId, differentPollId);

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        differentUserId,
        differentPollId,
      );
      expect(voteRepository.delete).toHaveBeenCalledWith(
        differentUserId,
        differentPollId,
      );
    });
  });
});
