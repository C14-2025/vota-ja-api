import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import IAuthLoginDTO from '~/domain/types/dtos/auth/IAuthLoginDTO';

export default class AuthLoginDTO implements IAuthLoginDTO {
  @ApiProperty({ type: 'string', description: 'User email', required: true })
  @IsEmail()
  @IsString({ message: 'The email must be a string' })
  @IsNotEmpty({ message: 'The email is required' })
  readonly email: string;

  @ApiProperty({ type: 'string', description: 'User password', required: true })
  @IsString({ message: 'The password must be a string' })
  @IsNotEmpty({ message: 'The password is required' })
  readonly password: string;
}
