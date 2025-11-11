import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../../config';
import UserModel from '../models/User';

export default TypeOrmModule.forRoot({
  ...config.typeOrmDb,
  entities: [UserModel],
});
