import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import ErrorResponseDTO from '~/infra/dtos/ErrorResponseDTO';

interface CommonResponsesOptions {
  badRequest?: boolean;
  unauthorized?: boolean;
  forbidden?: boolean;
  notFound?: boolean;
  conflict?: boolean;
  tooManyRequests?: boolean;
  internalServerError?: boolean;
}

export default function ApiCommonResponses(
  options: CommonResponsesOptions = {},
) {
  const decorators = [];

  if (options.badRequest !== false) {
    decorators.push(
      ApiBadRequestResponse({
        description: 'Bad or missing parameters',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  if (options.unauthorized !== false) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  if (options.forbidden !== false) {
    decorators.push(
      ApiForbiddenResponse({
        description: 'Wrong or missing credentials',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  if (options.notFound !== false) {
    decorators.push(
      ApiNotFoundResponse({
        description: 'Not found',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  if (options.conflict !== false) {
    decorators.push(
      ApiConflictResponse({
        description: 'Resource already exists',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  if (options.tooManyRequests !== false) {
    decorators.push(
      ApiTooManyRequestsResponse({
        description: 'Requests limit exceeded',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  if (options.internalServerError !== false) {
    decorators.push(
      ApiInternalServerErrorResponse({
        description: 'Internal server error',
        isArray: false,
        type: ErrorResponseDTO,
      }),
    );
  }

  return applyDecorators(...decorators);
}
