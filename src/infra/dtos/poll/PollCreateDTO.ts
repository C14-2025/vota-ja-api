import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsDateString,
} from 'class-validator';
import PollTypes from '~/domain/enums/PollTypes';

export default class PollCreateDTO {
  @ApiProperty({
    example: 'Qual a melhor linguagem de programação?',
    description: 'Poll title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Votação para escolher a melhor linguagem',
    description: 'Poll description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: PollTypes,
    example: PollTypes.PUBLIC,
    description: 'Type of poll (PUBLIC or PRIVATE)',
  })
  @IsEnum(PollTypes)
  @IsNotEmpty()
  type: PollTypes;

  @ApiProperty({
    example: ['TypeScript', 'JavaScript', 'Python', 'Go'],
    description: 'Array of poll options',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    example: '2023-12-31T23:59:59.000Z',
    description: 'Expiration date and time for the poll (optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
