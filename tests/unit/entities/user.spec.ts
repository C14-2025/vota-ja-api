import User from '../../../src/domain/entities/User';

describe('User entity', () => {
  it('should assign given partial properties in constructor', () => {
    const now = new Date();
    const props: Partial<User> = {
      id: '123',
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashed',
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
    };

    const user = new User(props);

    expect(user.id).toBe(props.id);
    expect(user.name).toBe(props.name);
    expect(user.email).toBe(props.email);
    expect(user.password).toBe(props.password);
    expect(user.lastLogin).toBe(now);
    expect(user.createdAt).toBe(now);
    expect(user.updatedAt).toBe(now);
  });

  it('should allow constructing with no props and then setting fields', () => {
    const user = new User();
    expect(user).toBeInstanceOf(User);

    expect(user.id).toBeUndefined();
    expect(user.email).toBeUndefined();

    user.id = 'u1';
    user.email = 'u1@example.com';

    expect(user.id).toBe('u1');
    expect(user.email).toBe('u1@example.com');
  });
});
