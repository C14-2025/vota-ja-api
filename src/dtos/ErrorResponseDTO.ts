import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { IErrorResponse } from '~/domain/types/IErroResponse';

export default class ErrorResponseDTO implements IErrorResponse {
  @ApiProperty()
  @IsNumber()
  readonly statusCode: number;

  @ApiProperty()
  @IsString()
  readonly error: string;

  @ApiProperty()
  readonly message: string | object;
}
