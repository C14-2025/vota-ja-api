import { ApiProperty } from '@nestjs/swagger';
import PollTypes from '~/domain/enums/PollTypes';
import { PollStatus } from '~/domain/enums/PollStatus';
import UserResponseDTO from '../user/UserResponseDTO';
import PollOptionWithVotesDTO from './PollOptionWithVotesDTO';

export default class PollWithVotesResponseDTO {
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

  @ApiProperty({ type: () => [PollOptionWithVotesDTO] })
  options: PollOptionWithVotesDTO[];

  @ApiProperty({ type: () => UserResponseDTO })
  creator: UserResponseDTO;

  @ApiProperty({
    example: 42,
    description: 'Total number of votes in this poll',
  })
  totalVotes: number;

  @ApiProperty({ example: '2025-11-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-10T10:00:00.000Z', required: false })
  updatedAt?: Date;
}
