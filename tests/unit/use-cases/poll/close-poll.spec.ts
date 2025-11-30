import { IPollRepository } from '../../../../src/domain/interfaces/repositories/IPollRepository';
import Poll from '../../../../src/domain/entities/Poll';
import User from '../../../../src/domain/entities/User';
import PollTypes from '../../../../src/domain/enums/PollTypes';
import { PollStatus } from '../../../../src/domain/enums/PollStatus';
import PollNotFoundError from '../../../../src/domain/errors/PollNotFoundError';
import UnauthorizedPollAccessError from '../../../../src/domain/errors/UnauthorizedPollAccessError';
import ClosePollUseCase from '~/domain/use-cases/poll/close-poll';

describe('ClosePollUseCase', () => {
  let closePollUseCase: ClosePollUseCase;
  let pollRepository: jest.Mocked<IPollRepository>;

  const mockCreator: User = {
    id: 'user-creator-123',
    name: 'Creator',
    email: 'creator@example.com',
    password: 'hash',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockOtherUser: User = {
    id: 'user-other-456',
    name: 'Other',
    email: 'other@example.com',
    password: 'hash',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const basePoll: Poll = {
    id: 'poll-1',
    title: 'Test Poll',
    description: 'desc',
    type: PollTypes.PUBLIC,
    status: PollStatus.OPEN,
    options: [],
    creator: mockCreator,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Poll;

  beforeEach(() => {
    pollRepository = {
      getById: jest.fn(),
      save: jest.fn(),
    } as any;

    closePollUseCase = new ClosePollUseCase(pollRepository);
  });

  it('should close the poll when user is the creator', async () => {
    const poll = { ...basePoll };
    pollRepository.getById.mockResolvedValue(poll);

    await closePollUseCase.execute('poll-1', mockCreator.id);

    expect(pollRepository.getById).toHaveBeenCalledWith('poll-1');
    expect(poll.status).toBe(PollStatus.CLOSED);
    expect(pollRepository.save).toHaveBeenCalledWith(poll);
  });

  it('should throw PollNotFoundError when poll does not exist', async () => {
    pollRepository.getById.mockResolvedValue(null);

    await expect(
      closePollUseCase.execute('poll-1', mockCreator.id),
    ).rejects.toThrow(PollNotFoundError);

    expect(pollRepository.save).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedPollAccessError when user is not the creator', async () => {
    const poll = { ...basePoll };
    pollRepository.getById.mockResolvedValue(poll);

    await expect(
      closePollUseCase.execute('poll-1', mockOtherUser.id),
    ).rejects.toThrow(UnauthorizedPollAccessError);

    expect(poll.status).toBe(PollStatus.OPEN);
    expect(pollRepository.save).not.toHaveBeenCalled();
  });

  it('should not change status if poll is already closed', async () => {
    const closedPoll = { ...basePoll, status: PollStatus.CLOSED };
    pollRepository.getById.mockResolvedValue(closedPoll);

    await closePollUseCase.execute('poll-1', mockCreator.id);

    expect(closedPoll.status).toBe(PollStatus.CLOSED);
    expect(pollRepository.save).toHaveBeenCalledWith(closedPoll);
  });

  it('should handle repository error when getting poll', async () => {
    pollRepository.getById.mockRejectedValue(new Error('DB error'));

    await expect(
      closePollUseCase.execute('poll-1', mockCreator.id),
    ).rejects.toThrow('DB error');

    expect(pollRepository.save).not.toHaveBeenCalled();
  });

  it('should handle repository error when saving poll', async () => {
    const poll = { ...basePoll };
    pollRepository.getById.mockResolvedValue(poll);
    pollRepository.save.mockRejectedValue(new Error('Save failed'));

    await expect(
      closePollUseCase.execute('poll-1', mockCreator.id),
    ).rejects.toThrow('Save failed');

    expect(poll.status).toBe(PollStatus.CLOSED);
    expect(pollRepository.save).toHaveBeenCalledTimes(1);
  });
});
