export default class User {
  constructor(props?: Partial<User>) {
    Object.assign(this, props);
  }

  id: string;

  name: string;

  email: string;

  password: string;

  lastLogin?: Date;

  createdAt: Date;

  updatedAt?: Date;
}
