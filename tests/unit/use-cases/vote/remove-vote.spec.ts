import RemoveVoteUseCase from '../../../../src/domain/use-cases/vote/remove';
import { IVoteRepository } from '../../../../src/domain/interfaces/repositories/IVoteRepository';
import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import { IPollRealtimePort } from '../../../../src/domain/ports/IPollRealtimePort';
import VoteNotFoundError from '../../../../src/domain/errors/VoteNotFoundError';
import Votes from '../../../../src/domain/entities/Vote';
import User from '../../../../src/domain/entities/User';
import Poll from '../../../../src/domain/entities/Poll';
import PollOption from '../../../../src/domain/entities/PollOption';

describe('RemoveVoteUseCase', () => {
  let removeVoteUseCase: RemoveVoteUseCase;
  let voteRepository: jest.Mocked<IVoteRepository>;
  let pollRepository: jest.Mocked<IPollRepository>;
  let pollRealtimePort: jest.Mocked<IPollRealtimePort>;

  beforeEach(() => {
    voteRepository = {
      create: jest.fn(),
      findByUserAndPoll: jest.fn(),
      countVotesByPollOption: jest.fn(),
      delete: jest.fn(),
    };

    pollRepository = {
      getResultsById: jest.fn(),
    } as any;

    pollRealtimePort = {
      publishPollUpdate: jest.fn(),
    } as any;

    removeVoteUseCase = new RemoveVoteUseCase(
      voteRepository,
      pollRepository,
      pollRealtimePort,
    );
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

    const mockPollResults = {
      pollId,
      title: 'Favorite Programming Language',
      description: 'Vote for your favorite language',
      totalVotes: 10,
      options: [
        {
          optionId: 'option-123',
          optionText: 'TypeScript',
          voteCount: 5,
          percentage: 50,
        },
        {
          optionId: 'option-456',
          optionText: 'JavaScript',
          voteCount: 5,
          percentage: 50,
        },
      ],
    };

    it('should remove a vote successfully and publish realtime update', async () => {
      voteRepository.findByUserAndPoll.mockResolvedValue(mockVote);
      voteRepository.delete.mockResolvedValue(undefined);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      await removeVoteUseCase.execute(userId, pollId);

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        userId,
        pollId,
      );
      expect(voteRepository.delete).toHaveBeenCalledTimes(1);
      expect(voteRepository.delete).toHaveBeenCalledWith(userId, pollId);
      expect(pollRepository.getResultsById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getResultsById).toHaveBeenCalledWith(pollId);
      expect(pollRealtimePort.publishPollUpdate).toHaveBeenCalledTimes(1);
      expect(pollRealtimePort.publishPollUpdate).toHaveBeenCalledWith(pollId, {
        pollId,
        optionId: 'option-123',
        totalVotes: 10,
        optionVotes: 5,
        percentage: 50,
      });
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
      expect(pollRepository.getResultsById).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
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
      expect(pollRepository.getResultsById).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
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
      expect(pollRepository.getResultsById).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should propagate repository errors from getResultsById', async () => {
      const error = new Error('Failed to get poll results');
      voteRepository.findByUserAndPoll.mockResolvedValue(mockVote);
      voteRepository.delete.mockResolvedValue(undefined);
      pollRepository.getResultsById.mockRejectedValue(error);

      await expect(removeVoteUseCase.execute(userId, pollId)).rejects.toThrow(
        'Failed to get poll results',
      );

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.delete).toHaveBeenCalledTimes(1);
      expect(pollRepository.getResultsById).toHaveBeenCalledTimes(1);
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should handle different user and poll IDs', async () => {
      const differentUserId = 'different-user-id';
      const differentPollId = 'different-poll-id';

      voteRepository.findByUserAndPoll.mockResolvedValue(mockVote);
      voteRepository.delete.mockResolvedValue(undefined);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      await removeVoteUseCase.execute(differentUserId, differentPollId);

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        differentUserId,
        differentPollId,
      );
      expect(voteRepository.delete).toHaveBeenCalledWith(
        differentUserId,
        differentPollId,
      );
      expect(pollRepository.getResultsById).toHaveBeenCalledWith(
        differentPollId,
      );
    });

    it('should not publish update when voted option is not found in results', async () => {
      const mockVoteWithDifferentOption: Votes = {
        ...mockVote,
        option: { ...mockOption, id: 'non-existent-option' },
      };

      voteRepository.findByUserAndPoll.mockResolvedValue(
        mockVoteWithDifferentOption,
      );
      voteRepository.delete.mockResolvedValue(undefined);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      await removeVoteUseCase.execute(userId, pollId);

      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });
  });
});
