import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';
import IAuthResponseDTO from '~/domain/types/dtos/auth/IAuthResponseDTO';
import User from '~/domain/entities/User';

export default class AuthResponseDTO implements IAuthResponseDTO {
  @ApiProperty({ type: 'string', description: 'User email', required: true })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ type: User, description: 'User email', required: true })
  @Type(() => User)
  readonly user: { id: string; email: string };
}
