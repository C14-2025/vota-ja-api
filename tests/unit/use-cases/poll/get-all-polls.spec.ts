import GetAllPollsUseCase from '../../../../src/domain/use-cases/poll/get-all';
import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import Poll from '../../../../src/domain/entities/Poll';
import User from '../../../../src/domain/entities/User';
import PollOption from '../../../../src/domain/entities/PollOption';
import PollTypes from '../../../../src/domain/enums/PollTypes';
import { Pagination } from 'nestjs-typeorm-paginate';

describe('GetAllPollsUseCase', () => {
  let getAllPollsUseCase: GetAllPollsUseCase;
  let pollRepository: jest.Mocked<IPollRepository>;

  beforeEach(() => {
    pollRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getResultsById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    getAllPollsUseCase = new GetAllPollsUseCase(pollRepository);
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

    const mockPolls: Poll[] = [
      {
        id: 'poll-1',
        title: 'First Poll',
        description: 'Description of first poll',
        type: PollTypes.PUBLIC,
        options: [mockPollOption1, mockPollOption2],
        creator: mockUser,
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      },
      {
        id: 'poll-2',
        title: 'Second Poll',
        description: 'Description of second poll',
        type: PollTypes.PRIVATE,
        options: [mockPollOption1],
        creator: mockUser,
        createdAt: new Date('2023-10-11T11:00:00.000Z'),
        updatedAt: new Date('2023-10-11T11:00:00.000Z'),
      },
      {
        id: 'poll-3',
        title: 'Third Poll',
        description: 'Description of third poll',
        type: PollTypes.PUBLIC,
        options: [mockPollOption1, mockPollOption2],
        creator: mockUser,
        createdAt: new Date('2023-10-12T12:00:00.000Z'),
      },
    ];

    it('should get all polls successfully with default pagination', async () => {
      const mockPagination: Pagination<Poll> = {
        items: mockPolls,
        meta: {
          itemCount: 3,
          totalItems: 3,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 1, limit: 10 });

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
        },
        undefined,
      );

      expect(result).toEqual(mockPagination);
      expect(result.items).toHaveLength(3);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
      expect(result.meta.totalItems).toBe(3);
    });

    it('should get polls with custom pagination', async () => {
      const mockPagination: Pagination<Poll> = {
        items: [mockPolls[0], mockPolls[1]],
        meta: {
          itemCount: 2,
          totalItems: 3,
          itemsPerPage: 2,
          totalPages: 2,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 1, limit: 2 });

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 2,
        },
        undefined,
      );

      expect(result).toEqual(mockPagination);
      expect(result.items).toHaveLength(2);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should get second page of polls', async () => {
      const mockPagination: Pagination<Poll> = {
        items: [mockPolls[2]],
        meta: {
          itemCount: 1,
          totalItems: 3,
          itemsPerPage: 2,
          totalPages: 2,
          currentPage: 2,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 2, limit: 2 });

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 2,
          limit: 2,
        },
        undefined,
      );

      expect(result).toEqual(mockPagination);
      expect(result.items).toHaveLength(1);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(2);
    });

    it('should return empty array when no polls exist', async () => {
      const mockPagination: Pagination<Poll> = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 1, limit: 10 });

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result.items).toEqual([]);
      expect(result.items).toHaveLength(0);
      expect(result.meta.totalItems).toBe(0);
    });

    it('should include poll relations (creator and options)', async () => {
      const mockPagination: Pagination<Poll> = {
        items: [mockPolls[0]],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 1, limit: 10 });

      expect(result.items[0]).toHaveProperty('creator');
      expect(result.items[0]).toHaveProperty('options');
      expect(result.items[0].creator).toEqual(mockUser);
      expect(result.items[0].options).toHaveLength(2);
    });

    it('should handle polls with different types (PUBLIC and PRIVATE)', async () => {
      const mockPagination: Pagination<Poll> = {
        items: mockPolls,
        meta: {
          itemCount: 3,
          totalItems: 3,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 1, limit: 10 });

      expect(result.items[0].type).toBe(PollTypes.PUBLIC);
      expect(result.items[1].type).toBe(PollTypes.PRIVATE);
      expect(result.items[2].type).toBe(PollTypes.PUBLIC);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database connection failed');
      pollRepository.findAll.mockRejectedValue(error);

      await expect(
        getAllPollsUseCase.execute({ page: 1, limit: 10 }),
      ).rejects.toThrow('Database connection failed');

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle large limit values', async () => {
      const mockPagination: Pagination<Poll> = {
        items: mockPolls,
        meta: {
          itemCount: 3,
          totalItems: 3,
          itemsPerPage: 100,
          totalPages: 1,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 1, limit: 100 });

      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 100,
        },
        undefined,
      );
      expect(result.meta.itemsPerPage).toBe(100);
    });

    it('should handle page beyond available data', async () => {
      const mockPagination: Pagination<Poll> = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 3,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 10,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute({ page: 10, limit: 10 });

      expect(result.items).toHaveLength(0);
      expect(result.meta.currentPage).toBe(10);
      expect(result.meta.totalItems).toBe(3);
    });

    it('should search polls by title', async () => {
      const searchTerm = 'First';
      const mockPagination: Pagination<Poll> = {
        items: [mockPolls[0]],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute(
        { page: 1, limit: 10 },
        searchTerm,
      );

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
        },
        searchTerm,
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('First Poll');
    });

    it('should search polls and return empty when no matches', async () => {
      const searchTerm = 'NonExistent';
      const mockPagination: Pagination<Poll> = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute(
        { page: 1, limit: 10 },
        searchTerm,
      );

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
        },
        searchTerm,
      );

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalItems).toBe(0);
    });

    it('should search polls with pagination', async () => {
      const searchTerm = 'Poll';
      const mockPagination: Pagination<Poll> = {
        items: [mockPolls[0], mockPolls[1]],
        meta: {
          itemCount: 2,
          totalItems: 3,
          itemsPerPage: 2,
          totalPages: 2,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute(
        { page: 1, limit: 2 },
        searchTerm,
      );

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 2,
        },
        searchTerm,
      );

      expect(result.items).toHaveLength(2);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.currentPage).toBe(1);
    });

    it('should handle empty search string', async () => {
      const searchTerm = '';
      const mockPagination: Pagination<Poll> = {
        items: mockPolls,
        meta: {
          itemCount: 3,
          totalItems: 3,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      pollRepository.findAll.mockResolvedValue(mockPagination);

      const result = await getAllPollsUseCase.execute(
        { page: 1, limit: 10 },
        searchTerm,
      );

      expect(pollRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepository.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
        },
        searchTerm,
      );

      expect(result.items).toHaveLength(3);
    });
  });
});
