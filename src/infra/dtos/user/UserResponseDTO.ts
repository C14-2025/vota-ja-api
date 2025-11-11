import { ApiProperty } from '@nestjs/swagger';

export default class UserResponseDTO {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: '2023-10-10T10:00:00.000Z',
    description: 'Date when user last logged in',
    required: false,
  })
  lastLogin?: Date;

  @ApiProperty({
    example: '2023-10-10T10:00:00.000Z',
    description: 'Date when user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-10-10T10:00:00.000Z',
    description: 'Date when user was last updated',
  })
  updatedAt: Date;
}
