import { ApiProperty } from '@nestjs/swagger';

export default class PollOptionResponseDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'TypeScript' })
  text: string;

  @ApiProperty({ example: '2025-11-10T10:00:00.000Z' })
  createdAt: Date;
}
