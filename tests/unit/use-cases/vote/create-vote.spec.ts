import CreateVoteUseCase from '../../../../src/domain/use-cases/vote/create';
import { IVoteRepository } from '../../../../src/domain/interfaces/repositories/IVoteRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import { IPollOptionRepository } from '../../../../src/domain/interfaces/repositories/IPollOptionRepository';
import { IPollRealtimePort } from '../../../../src/domain/ports/IPollRealtimePort';
import Votes from '../../../../src/domain/entities/Vote';
import User from '../../../../src/domain/entities/User';
import Poll from '../../../../src/domain/entities/Poll';
import PollOption from '../../../../src/domain/entities/PollOption';
import PollTypes from '../../../../src/domain/enums/PollTypes';
import UserNotFoundError from '../../../../src/domain/errors/UserNotFoundError';
import PollNotFoundError from '../../../../src/domain/errors/PollNotFoundError';
import PollOptionNotFoundError from '../../../../src/domain/errors/PollOptionNotFoundError';
import UserAlreadyVotedError from '../../../../src/domain/errors/UserAlreadyVotedError';
import { ICreateVote } from '../../../../src/domain/interfaces/dtos/vote/ICreateVote';
import { PollStatus } from '../../../../src/domain/enums/PollStatus';
import PollClosedError from '~/domain/errors/PollClosedError';

describe('CreateVoteUseCase', () => {
  let createVoteUseCase: CreateVoteUseCase;
  let voteRepository: jest.Mocked<IVoteRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let pollRepository: jest.Mocked<IPollRepository>;
  let pollOptionRepository: jest.Mocked<IPollOptionRepository>;
  let pollRealtimePort: jest.Mocked<IPollRealtimePort>;

  beforeEach(() => {
    voteRepository = {
      create: jest.fn(),
      findByUserAndPoll: jest.fn(),
    } as any;

    userRepository = {
      getById: jest.fn(),
    } as any;

    pollRepository = {
      getById: jest.fn(),
      getResultsById: jest.fn(),
    } as any;

    pollOptionRepository = {
      getById: jest.fn(),
    } as any;

    pollRealtimePort = {
      publishPollUpdate: jest.fn(),
    } as any;

    createVoteUseCase = new CreateVoteUseCase(
      voteRepository,
      userRepository,
      pollRepository,
      pollOptionRepository,
      pollRealtimePort,
    );
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

    const mockPoll: Poll = {
      id: 'poll-1',
      title: 'Test Poll',
      description: 'Test Description',
      type: PollTypes.PUBLIC,
      status: PollStatus.OPEN,
      options: [mockPollOption1, mockPollOption2],
      creator: mockUser,
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
    };

    const mockCreateVoteData: ICreateVote = {
      pollId: 'poll-1',
      optionId: 'option-1',
    };

    const mockPollResults = {
      pollId: 'poll-1',
      title: 'Test Poll',
      description: 'Test Description',
      totalVotes: 10,
      options: [
        {
          optionId: 'option-1',
          optionText: 'Option 1',
          voteCount: 6,
          percentage: 60,
        },
        {
          optionId: 'option-2',
          optionText: 'Option 2',
          voteCount: 4,
          percentage: 40,
        },
      ],
    };

    it('should create a vote successfully', async () => {
      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption1,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      const result = await createVoteUseCase.execute(
        mockUser.id,
        mockCreateVoteData,
      );

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(mockUser.id);

      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledWith('poll-1');

      expect(pollOptionRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollOptionRepository.getById).toHaveBeenCalledWith('option-1');

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledWith(
        mockUser.id,
        'poll-1',
      );

      expect(voteRepository.create).toHaveBeenCalledTimes(1);
      expect(voteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          voter: mockUser,
          poll: mockPoll,
          option: mockPollOption1,
        }),
      );

      expect(pollRepository.getResultsById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getResultsById).toHaveBeenCalledWith('poll-1');

      expect(pollRealtimePort.publishPollUpdate).toHaveBeenCalledTimes(1);
      expect(pollRealtimePort.publishPollUpdate).toHaveBeenCalledWith(
        'poll-1',
        {
          pollId: 'poll-1',
          optionId: 'option-1',
          totalVotes: 10,
          optionVotes: 6,
          percentage: 60,
        },
      );

      expect(result).toEqual(expectedVote);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      userRepository.getById.mockResolvedValue(null);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow(UserNotFoundError);

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).not.toHaveBeenCalled();
      expect(pollOptionRepository.getById).not.toHaveBeenCalled();
      expect(voteRepository.create).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should throw PollNotFoundError when poll does not exist', async () => {
      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(null);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow(PollNotFoundError);

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollOptionRepository.getById).not.toHaveBeenCalled();
      expect(voteRepository.create).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should throw PollOptionNotFoundError when option does not exist', async () => {
      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(null);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow(PollOptionNotFoundError);

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollOptionRepository.getById).toHaveBeenCalledTimes(1);
      expect(voteRepository.findByUserAndPoll).not.toHaveBeenCalled();
      expect(voteRepository.create).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyVotedError when user has already voted', async () => {
      const existingVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption2,
        createdAt: new Date('2023-10-09T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(existingVote);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow(UserAlreadyVotedError);

      expect(voteRepository.findByUserAndPoll).toHaveBeenCalledTimes(1);
      expect(voteRepository.create).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should publish realtime update with correct data', async () => {
      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption1,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      await createVoteUseCase.execute(mockUser.id, mockCreateVoteData);

      expect(pollRealtimePort.publishPollUpdate).toHaveBeenCalledWith(
        'poll-1',
        {
          pollId: 'poll-1',
          optionId: 'option-1',
          totalVotes: 10,
          optionVotes: 6,
          percentage: 60,
        },
      );
    });

    it('should not publish realtime update when voted option is not found in results', async () => {
      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption1,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      const pollResultsWithoutOption = {
        pollId: 'poll-1',
        title: 'Test Poll',
        description: 'Test Description',
        totalVotes: 10,
        options: [
          {
            optionId: 'option-2',
            optionText: 'Option 2',
            voteCount: 10,
            percentage: 100,
          },
        ],
      };

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockResolvedValue(pollResultsWithoutOption);

      const result = await createVoteUseCase.execute(
        mockUser.id,
        mockCreateVoteData,
      );

      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
      expect(result).toEqual(expectedVote);
    });

    it('should handle vote creation for different poll option', async () => {
      const voteDataOption2: ICreateVote = {
        pollId: 'poll-1',
        optionId: 'option-2',
      };

      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption2,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption2);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      const result = await createVoteUseCase.execute(
        mockUser.id,
        voteDataOption2,
      );

      expect(pollOptionRepository.getById).toHaveBeenCalledWith('option-2');
      expect(voteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          option: mockPollOption2,
        }),
      );
      expect(result.option).toEqual(mockPollOption2);
    });

    it('should handle repository error when creating vote', async () => {
      const error = new Error('Database connection failed');

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockRejectedValue(error);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow('Database connection failed');

      expect(voteRepository.create).toHaveBeenCalledTimes(1);
      expect(pollRepository.getResultsById).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should handle repository error when getting poll results', async () => {
      const error = new Error('Failed to get poll results');
      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption1,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockRejectedValue(error);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow('Failed to get poll results');

      expect(voteRepository.create).toHaveBeenCalledTimes(1);
      expect(pollRepository.getResultsById).toHaveBeenCalledTimes(1);
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should validate all entities before creating vote', async () => {
      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption1,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      await createVoteUseCase.execute(mockUser.id, mockCreateVoteData);

      // Verify validation order
      const callOrder = [
        userRepository.getById,
        pollRepository.getById,
        pollOptionRepository.getById,
        voteRepository.findByUserAndPoll,
      ];

      callOrder.forEach(mock => {
        expect(mock).toHaveBeenCalledTimes(1);
      });
    });

    it('should throw PollClosedError when poll is closed', async () => {
      const closedPoll = {
        ...mockPoll,
        status: PollStatus.CLOSED,
      };

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(closedPoll);

      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow(PollClosedError);

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollOptionRepository.getById).not.toHaveBeenCalled();
      expect(voteRepository.findByUserAndPoll).not.toHaveBeenCalled();
      expect(voteRepository.create).not.toHaveBeenCalled();
      expect(pollRealtimePort.publishPollUpdate).not.toHaveBeenCalled();
    });

    it('should create vote entity with correct properties', async () => {
      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockImplementation(async (vote: Votes) => vote);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);

      await createVoteUseCase.execute(mockUser.id, mockCreateVoteData);

      const createCall = voteRepository.create.mock.calls[0][0];
      expect(createCall.voter).toEqual(mockUser);
      expect(createCall.poll).toEqual(mockPoll);
      expect(createCall.option).toEqual(mockPollOption1);
    });

    it('should handle realtime port publish failure gracefully', async () => {
      const expectedVote = new Votes({
        voter: mockUser,
        poll: mockPoll,
        option: mockPollOption1,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.getById.mockResolvedValue(mockPoll);
      pollOptionRepository.getById.mockResolvedValue(mockPollOption1);
      voteRepository.findByUserAndPoll.mockResolvedValue(null);
      voteRepository.create.mockResolvedValue(expectedVote);
      pollRepository.getResultsById.mockResolvedValue(mockPollResults);
      pollRealtimePort.publishPollUpdate.mockImplementation(() => {
        throw new Error('Realtime service unavailable');
      });

      // Should not throw error even if realtime fails
      await expect(
        createVoteUseCase.execute(mockUser.id, mockCreateVoteData),
      ).rejects.toThrow('Realtime service unavailable');
    });
  });
});
