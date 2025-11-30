import GetPollByIdUseCase from '../../../../src/domain/use-cases/poll/get-by-id';
import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import { IVoteRepository } from '../../../../src/domain/interfaces/repositories/IVoteRepository';
import Poll from '../../../../src/domain/entities/Poll';
import User from '../../../../src/domain/entities/User';
import PollOption from '../../../../src/domain/entities/PollOption';
import Vote from '../../../../src/domain/entities/Vote';
import PollTypes from '../../../../src/domain/enums/PollTypes';
import PollNotFoundError from '../../../../src/domain/errors/PollNotFoundError';
import UnauthorizedPollAccessError from '../../../../src/domain/errors/UnauthorizedPollAccessError';
import { PollStatus } from '../../../../src/domain/enums/PollStatus';

describe('GetPollByIdUseCase', () => {
  let getPollByIdUseCase: GetPollByIdUseCase;
  let pollRepository: jest.Mocked<IPollRepository>;
  let voteRepository: jest.Mocked<IVoteRepository>;

  beforeEach(() => {
    pollRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getResultsById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    voteRepository = {
      countVotesByPollOption: jest.fn(),
      findByUserAndPoll: jest.fn(),
    } as any;

    getPollByIdUseCase = new GetPollByIdUseCase(pollRepository, voteRepository);
  });

  describe('execute', () => {
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      lastLogin: new Date('2023-10-15T14:30:00.000Z'),
    };

    const mockPollOption1: PollOption = {
      id: 'option-1',
      text: 'Option 1',
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
    } as PollOption;

    const mockPollOption2: PollOption = {
      id: 'option-2',
      text: 'Option 2',
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
    } as PollOption;

    const mockPublicPoll: Poll = {
      id: 'poll-1',
      title: 'Public Poll',
      description: 'This is a public poll',
      type: PollTypes.PUBLIC,
      status: PollStatus.OPEN,
      options: [mockPollOption1, mockPollOption2],
      creator: mockUser,
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
    };

    const mockPrivatePoll: Poll = {
      ...mockPublicPoll,
      id: 'poll-2',
      title: 'Private Poll',
      type: PollTypes.PRIVATE,
    };

    const mockVoteCounts = [
      { optionId: 'option-1', count: 5 },
      { optionId: 'option-2', count: 3 },
    ];

    const mockUserVote: Vote = {
      voter: mockUser,
      poll: mockPublicPoll,
      option: mockPollOption2,
      createdAt: new Date(),
    } as Vote;

    it('should get public poll with vote counts and votedOption null when no userId', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(pollRepository.getById).toHaveBeenCalledWith('poll-1');
      expect(voteRepository.countVotesByPollOption).toHaveBeenCalledWith(
        'poll-1',
      );
      expect(voteRepository.findByUserAndPoll).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...mockPublicPoll,
        voteCounts: mockVoteCounts,
        totalVotes: 8,
        votedOption: null,
      });
    });

    it('should return votedOption when user voted', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);
      voteRepository.findByUserAndPoll.mockResolvedValue(mockUserVote);

      const result = await getPollByIdUseCase.execute('poll-1', mockUser.id);

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        mockUser.id,
        'poll-1',
      );
      expect(result.votedOption).toBe(mockPollOption2);
      expect(result.totalVotes).toBe(8);
    });

    it('should return votedOption null when user has not voted', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);

      const result = await getPollByIdUseCase.execute('poll-1', mockUser.id);

      expect(result.votedOption).toBeNull();
    });

    it('should get private poll and include votedOption when userId provided', async () => {
      pollRepository.getById.mockResolvedValue(mockPrivatePoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);
      voteRepository.findByUserAndPoll.mockResolvedValue(mockUserVote);

      const result = await getPollByIdUseCase.execute('poll-2', mockUser.id);

      expect(result.type).toBe(PollTypes.PRIVATE);
      expect(result.votedOption).toBe(mockPollOption2);
      expect(result.totalVotes).toBe(8);
    });

    it('should throw PollNotFoundError when poll does not exist', async () => {
      pollRepository.getById.mockResolvedValue(null);

      await expect(getPollByIdUseCase.execute('non-existent')).rejects.toThrow(
        PollNotFoundError,
      );
      expect(voteRepository.countVotesByPollOption).not.toHaveBeenCalled();
      expect(voteRepository.findByUserAndPoll).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedPollAccessError for private poll without userId', async () => {
      pollRepository.getById.mockResolvedValue(mockPrivatePoll);

      await expect(getPollByIdUseCase.execute('poll-2')).rejects.toThrow(
        UnauthorizedPollAccessError,
      );
      expect(voteRepository.countVotesByPollOption).not.toHaveBeenCalled();
      expect(voteRepository.findByUserAndPoll).not.toHaveBeenCalled();
    });

    it('should return zero votes when no votes exist', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue([]);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.voteCounts).toEqual([]);
      expect(result.totalVotes).toBe(0);
      expect(result.votedOption).toBeNull();
    });

    it('should calculate totalVotes correctly with many options', async () => {
      const manyVotes = [
        { optionId: 'option-1', count: 15 },
        { optionId: 'option-2', count: 22 },
        { optionId: 'option-3', count: 8 },
      ];

      const pollWithThree = {
        ...mockPublicPoll,
        options: [
          mockPollOption1,
          mockPollOption2,
          {
            id: 'option-3',
            text: 'Option 3',
            createdAt: new Date(),
          } as PollOption,
        ],
      };

      pollRepository.getById.mockResolvedValue(pollWithThree);
      voteRepository.countVotesByPollOption.mockResolvedValue(manyVotes);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.totalVotes).toBe(45);
    });

    it('should preserve all poll properties and add votedOption', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);
      voteRepository.findByUserAndPoll.mockResolvedValue(mockUserVote);

      const result = await getPollByIdUseCase.execute('poll-1', mockUser.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('options');
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('voteCounts');
      expect(result).toHaveProperty('totalVotes');
      expect(result).toHaveProperty('votedOption');
      expect(result.votedOption).toBe(mockPollOption2);
    });

    it('should handle repository error when getting poll', async () => {
      pollRepository.getById.mockRejectedValue(new Error('DB error'));

      await expect(getPollByIdUseCase.execute('poll-1')).rejects.toThrow(
        'DB error',
      );
    });

    it('should handle repository error when counting votes', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockRejectedValue(
        new Error('Count error'),
      );

      await expect(getPollByIdUseCase.execute('poll-1')).rejects.toThrow(
        'Count error',
      );
    });

    it('should handle repository error when finding user vote', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);
      voteRepository.findByUserAndPoll.mockRejectedValue(
        new Error('Find vote error'),
      );

      await expect(
        getPollByIdUseCase.execute('poll-1', mockUser.id),
      ).rejects.toThrow('Find vote error');
    });
  });
});
