import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export default class VoteCreateDTO {
  @ApiProperty({
    description: 'The ID of the poll option to vote for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  optionId: string;
}
