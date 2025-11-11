import { ApiProperty } from '@nestjs/swagger';

export default class VoteResponseDTO {
  @ApiProperty({
    description: 'The user who voted',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
    },
  })
  voter: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description: 'The poll that was voted on',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Best Programming Language',
    },
  })
  poll: {
    id: string;
    title: string;
  };

  @ApiProperty({
    description: 'The option that was voted for',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174002',
      text: 'TypeScript',
    },
  })
  option: {
    id: string;
    text: string;
  };

  @ApiProperty({
    description: 'The date the vote was created',
    example: '2025-11-10T12:00:00.000Z',
  })
  createdAt: Date;
}
