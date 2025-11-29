import CreatePollUseCase from '../../../../src/domain/use-cases/poll/create';
import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import Poll from '../../../../src/domain/entities/Poll';
import User from '../../../../src/domain/entities/User';
import PollOption from '../../../../src/domain/entities/PollOption';
import PollTypes from '../../../../src/domain/enums/PollTypes';
import UserNotFoundError from '../../../../src/domain/errors/UserNotFoundError';
import { ICreatePoll } from '../../../../src/domain/interfaces/dtos/poll/ICreatePoll';

describe('CreatePollUseCase', () => {
  let createPollUseCase: CreatePollUseCase;
  let pollRepository: jest.Mocked<IPollRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    pollRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getResultsById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    userRepository = {
      getById: jest.fn(),
    } as any;

    createPollUseCase = new CreatePollUseCase(pollRepository, userRepository);
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

    const mockCreatePollData: ICreatePoll = {
      title: 'What is your favorite color?',
      description: 'Please vote for your favorite color',
      type: PollTypes.PUBLIC,
      options: ['Red', 'Blue', 'Green'],
    };

    it('should create a poll successfully', async () => {
      const expectedPoll = new Poll({
        id: 'poll-123',
        creator: mockUser,
        title: mockCreatePollData.title,
        description: mockCreatePollData.description,
        type: mockCreatePollData.type,
        options: mockCreatePollData.options.map(
          text => new PollOption({ text }),
        ),
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.create.mockResolvedValue(expectedPoll);

      const result = await createPollUseCase.execute(
        mockUser.id,
        mockCreatePollData,
      );

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(mockUser.id);

      expect(pollRepository.create).toHaveBeenCalledTimes(1);
      expect(pollRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          creator: mockUser,
          title: mockCreatePollData.title,
          description: mockCreatePollData.description,
          type: mockCreatePollData.type,
          options: expect.arrayContaining([
            expect.objectContaining({ text: 'Red' }),
            expect.objectContaining({ text: 'Blue' }),
            expect.objectContaining({ text: 'Green' }),
          ]),
        }),
      );

      expect(result).toEqual(expectedPoll);
      expect(result.title).toBe(mockCreatePollData.title);
      expect(result.creator).toEqual(mockUser);
      expect(result.options).toHaveLength(3);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      userRepository.getById.mockResolvedValue(null);

      await expect(
        createPollUseCase.execute(mockUser.id, mockCreatePollData),
      ).rejects.toThrow(UserNotFoundError);

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(mockUser.id);
      expect(pollRepository.create).not.toHaveBeenCalled();
    });

    it('should create a poll with PRIVATE type', async () => {
      const privatePollData: ICreatePoll = {
        ...mockCreatePollData,
        type: PollTypes.PRIVATE,
      };

      const expectedPoll = new Poll({
        id: 'poll-456',
        creator: mockUser,
        title: privatePollData.title,
        description: privatePollData.description,
        type: PollTypes.PRIVATE,
        options: privatePollData.options.map(text => new PollOption({ text })),
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.create.mockResolvedValue(expectedPoll);

      const result = await createPollUseCase.execute(
        mockUser.id,
        privatePollData,
      );

      expect(result.type).toBe(PollTypes.PRIVATE);
      expect(pollRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: PollTypes.PRIVATE,
        }),
      );
    });

    it('should create a poll with two options', async () => {
      const twoOptionsPollData: ICreatePoll = {
        title: 'Yes or No?',
        description: 'Simple question',
        type: PollTypes.PUBLIC,
        options: ['Yes', 'No'],
      };

      const expectedPoll = new Poll({
        id: 'poll-789',
        creator: mockUser,
        title: twoOptionsPollData.title,
        description: twoOptionsPollData.description,
        type: twoOptionsPollData.type,
        options: twoOptionsPollData.options.map(
          text => new PollOption({ text }),
        ),
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.create.mockResolvedValue(expectedPoll);

      const result = await createPollUseCase.execute(
        mockUser.id,
        twoOptionsPollData,
      );

      expect(result.options).toHaveLength(2);
      expect(pollRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.arrayContaining([
            expect.objectContaining({ text: 'Yes' }),
            expect.objectContaining({ text: 'No' }),
          ]),
        }),
      );
    });

    it('should create a poll with multiple options', async () => {
      const multipleOptionsPollData: ICreatePoll = {
        title: 'Best programming language?',
        description: 'Vote for your favorite',
        type: PollTypes.PUBLIC,
        options: ['JavaScript', 'Python', 'TypeScript', 'Java', 'C#'],
      };

      const expectedPoll = new Poll({
        id: 'poll-multi',
        creator: mockUser,
        title: multipleOptionsPollData.title,
        description: multipleOptionsPollData.description,
        type: multipleOptionsPollData.type,
        options: multipleOptionsPollData.options.map(
          text => new PollOption({ text }),
        ),
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      });

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.create.mockResolvedValue(expectedPoll);

      const result = await createPollUseCase.execute(
        mockUser.id,
        multipleOptionsPollData,
      );

      expect(result.options).toHaveLength(5);
      expect(pollRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.arrayContaining([
            expect.objectContaining({ text: 'JavaScript' }),
            expect.objectContaining({ text: 'Python' }),
            expect.objectContaining({ text: 'TypeScript' }),
            expect.objectContaining({ text: 'Java' }),
            expect.objectContaining({ text: 'C#' }),
          ]),
        }),
      );
    });

    it('should handle repository creation error', async () => {
      const error = new Error('Database connection failed');

      userRepository.getById.mockResolvedValue(mockUser);
      pollRepository.create.mockRejectedValue(error);

      await expect(
        createPollUseCase.execute(mockUser.id, mockCreatePollData),
      ).rejects.toThrow('Database connection failed');

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create poll options with correct mapping', async () => {
      const pollData: ICreatePoll = {
        title: 'Test Poll',
        description: 'Test Description',
        type: PollTypes.PUBLIC,
        options: ['Option A', 'Option B', 'Option C'],
      };

      userRepository.getById.mockResolvedValue(mockUser);

      // Captura o argumento passado para o create
      pollRepository.create.mockImplementation(async (poll: Poll) => {
        return {
          ...poll,
          id: 'generated-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Poll;
      });

      const result = await createPollUseCase.execute(mockUser.id, pollData);

      expect(pollRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.arrayContaining([
            expect.any(PollOption),
            expect.any(PollOption),
            expect.any(PollOption),
          ]),
        }),
      );

      // Verifica que as options foram mapeadas corretamente
      const createCall = pollRepository.create.mock.calls[0][0];
      expect(createCall.options[0].text).toBe('Option A');
      expect(createCall.options[1].text).toBe('Option B');
      expect(createCall.options[2].text).toBe('Option C');
    });

    it('should handle user repository error', async () => {
      const error = new Error('User service unavailable');

      userRepository.getById.mockRejectedValue(error);

      await expect(
        createPollUseCase.execute(mockUser.id, mockCreatePollData),
      ).rejects.toThrow('User service unavailable');

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(pollRepository.create).not.toHaveBeenCalled();
    });

    it('should maintain poll data integrity', async () => {
      const pollData: ICreatePoll = {
        title: 'Integrity Test',
        description: 'Testing data integrity',
        type: PollTypes.PRIVATE,
        options: ['A', 'B'],
      };

      userRepository.getById.mockResolvedValue(mockUser);

      pollRepository.create.mockImplementation(async (poll: Poll) => {
        return poll;
      });

      await createPollUseCase.execute(mockUser.id, pollData);

      const createCall = pollRepository.create.mock.calls[0][0];

      expect(createCall.title).toBe(pollData.title);
      expect(createCall.description).toBe(pollData.description);
      expect(createCall.type).toBe(pollData.type);
      expect(createCall.creator).toEqual(mockUser);
      expect(createCall.options).toHaveLength(pollData.options.length);
    });
  });
});
