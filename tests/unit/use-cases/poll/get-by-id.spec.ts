import GetPollByIdUseCase from '../../../../src/domain/use-cases/poll/get-by-id';
import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import { IVoteRepository } from '../../../../src/domain/interfaces/repositories/IVoteRepository';
import Poll from '../../../../src/domain/entities/Poll';
import User from '../../../../src/domain/entities/User';
import PollOption from '../../../../src/domain/entities/PollOption';
import PollTypes from '../../../../src/domain/enums/PollTypes';
import PollNotFoundError from '../../../../src/domain/errors/PollNotFoundError';
import UnauthorizedPollAccessError from '../../../../src/domain/errors/UnauthorizedPollAccessError';

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
      options: [mockPollOption1, mockPollOption2],
      creator: mockUser,
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
    };

    const mockPrivatePoll: Poll = {
      id: 'poll-2',
      title: 'Private Poll',
      description: 'This is a private poll',
      type: PollTypes.PRIVATE,
      options: [mockPollOption1, mockPollOption2],
      creator: mockUser,
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
    };

    const mockVoteCounts = [
      { optionId: 'option-1', count: 5 },
      { optionId: 'option-2', count: 3 },
    ];

    it('should get public poll by id successfully with vote counts', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledWith('poll-1');

      expect(voteRepository.countVotesByPollOption).toHaveBeenCalledTimes(1);
      expect(voteRepository.countVotesByPollOption).toHaveBeenCalledWith(
        'poll-1',
      );

      expect(result).toEqual({
        ...mockPublicPoll,
        voteCounts: mockVoteCounts,
        totalVotes: 8,
      });
      expect(result.voteCounts).toHaveLength(2);
      expect(result.totalVotes).toBe(8);
    });

    it('should get public poll by id with userId', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-1', mockUser.id);

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledWith('poll-1');

      expect(result.id).toBe('poll-1');
      expect(result.type).toBe(PollTypes.PUBLIC);
      expect(result.totalVotes).toBe(8);
    });

    it('should get private poll by id when userId is provided', async () => {
      pollRepository.getById.mockResolvedValue(mockPrivatePoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-2', mockUser.id);

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledWith('poll-2');

      expect(voteRepository.countVotesByPollOption).toHaveBeenCalledTimes(1);
      expect(voteRepository.countVotesByPollOption).toHaveBeenCalledWith(
        'poll-2',
      );

      expect(result).toEqual({
        ...mockPrivatePoll,
        voteCounts: mockVoteCounts,
        totalVotes: 8,
      });
      expect(result.type).toBe(PollTypes.PRIVATE);
    });

    it('should throw PollNotFoundError when poll does not exist', async () => {
      pollRepository.getById.mockResolvedValue(null);

      await expect(
        getPollByIdUseCase.execute('non-existent-poll'),
      ).rejects.toThrow(PollNotFoundError);

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledWith('non-existent-poll');
      expect(voteRepository.countVotesByPollOption).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedPollAccessError when accessing private poll without userId', async () => {
      pollRepository.getById.mockResolvedValue(mockPrivatePoll);

      await expect(getPollByIdUseCase.execute('poll-2')).rejects.toThrow(
        UnauthorizedPollAccessError,
      );

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledWith('poll-2');
      expect(voteRepository.countVotesByPollOption).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedPollAccessError when accessing private poll with undefined userId', async () => {
      pollRepository.getById.mockResolvedValue(mockPrivatePoll);

      await expect(
        getPollByIdUseCase.execute('poll-2', undefined),
      ).rejects.toThrow(UnauthorizedPollAccessError);

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(voteRepository.countVotesByPollOption).not.toHaveBeenCalled();
    });

    it('should return poll with zero votes when no votes exist', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue([]);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.voteCounts).toEqual([]);
      expect(result.totalVotes).toBe(0);
    });

    it('should return poll with votes for only one option', async () => {
      const singleVoteCount = [{ optionId: 'option-1', count: 10 }];

      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(singleVoteCount);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.voteCounts).toEqual(singleVoteCount);
      expect(result.totalVotes).toBe(10);
    });

    it('should calculate totalVotes correctly with multiple vote counts', async () => {
      const multipleVoteCounts = [
        { optionId: 'option-1', count: 15 },
        { optionId: 'option-2', count: 22 },
        { optionId: 'option-3', count: 8 },
      ];

      const pollWithThreeOptions: Poll = {
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

      pollRepository.getById.mockResolvedValue(pollWithThreeOptions);
      voteRepository.countVotesByPollOption.mockResolvedValue(
        multipleVoteCounts,
      );

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.voteCounts).toHaveLength(3);
      expect(result.totalVotes).toBe(45);
    });

    it('should include all poll properties in the result', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('options');
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('voteCounts');
      expect(result).toHaveProperty('totalVotes');

      expect(result.id).toBe(mockPublicPoll.id);
      expect(result.title).toBe(mockPublicPoll.title);
      expect(result.description).toBe(mockPublicPoll.description);
      expect(result.type).toBe(mockPublicPoll.type);
      expect(result.options).toEqual(mockPublicPoll.options);
      expect(result.creator).toEqual(mockPublicPoll.creator);
    });

    it('should handle repository error when getting poll', async () => {
      const error = new Error('Database connection failed');
      pollRepository.getById.mockRejectedValue(error);

      await expect(getPollByIdUseCase.execute('poll-1')).rejects.toThrow(
        'Database connection failed',
      );

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(voteRepository.countVotesByPollOption).not.toHaveBeenCalled();
    });

    it('should handle repository error when counting votes', async () => {
      const error = new Error('Vote counting service unavailable');
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockRejectedValue(error);

      await expect(getPollByIdUseCase.execute('poll-1')).rejects.toThrow(
        'Vote counting service unavailable',
      );

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(voteRepository.countVotesByPollOption).toHaveBeenCalledTimes(1);
    });

    it('should handle very large vote counts', async () => {
      const largeVoteCounts = [
        { optionId: 'option-1', count: 1000000 },
        { optionId: 'option-2', count: 999999 },
      ];

      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(largeVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.totalVotes).toBe(1999999);
      expect(result.voteCounts).toEqual(largeVoteCounts);
    });

    it('should preserve poll relations (creator and options)', async () => {
      pollRepository.getById.mockResolvedValue(mockPublicPoll);
      voteRepository.countVotesByPollOption.mockResolvedValue(mockVoteCounts);

      const result = await getPollByIdUseCase.execute('poll-1');

      expect(result.creator).toBeDefined();
      expect(result.creator.id).toBe(mockUser.id);
      expect(result.creator.name).toBe(mockUser.name);
      expect(result.options).toBeDefined();
      expect(result.options).toHaveLength(2);
      expect(result.options[0].id).toBe('option-1');
      expect(result.options[1].id).toBe('option-2');
    });
  });
});
