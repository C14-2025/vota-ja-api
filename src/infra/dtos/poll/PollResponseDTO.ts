import { ApiProperty } from '@nestjs/swagger';
import PollTypes from '~/domain/enums/PollTypes';
import { PollStatus } from '~/domain/enums/PollStatus';
import UserResponseDTO from '../user/UserResponseDTO';
import PollOptionResponseDTO from './PollOptionResponseDTO';

export default class PollResponseDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Qual a melhor linguagem de programação?' })
  title: string;

  @ApiProperty({ example: 'Votação para escolher a melhor linguagem' })
  description: string;

  @ApiProperty({ enum: PollTypes, example: PollTypes.PUBLIC })
  type: PollTypes;

  @ApiProperty({ enum: PollStatus, example: PollStatus.OPEN })
  status: PollStatus;

  @ApiProperty({ type: () => [PollOptionResponseDTO] })
  options: PollOptionResponseDTO[];

  @ApiProperty({ type: () => UserResponseDTO })
  creator: UserResponseDTO;

  @ApiProperty({ example: '2025-11-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-10T10:00:00.000Z', required: false })
  updatedAt?: Date;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    required: false,
    description: 'Date and time when the poll will expire and be automatically closed'
  })
  expiresAt?: Date;
}
