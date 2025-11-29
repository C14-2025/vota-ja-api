import { Column, Entity } from 'typeorm';

import BaseModel from './Base';
import User from '~/domain/entities/User';

@Entity('users')
export default class UserModel extends BaseModel implements User {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, name: 'last_login' })
  lastLogin?: Date;
}
