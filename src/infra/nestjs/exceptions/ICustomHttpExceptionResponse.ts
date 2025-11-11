import { IErrorResponse } from '~/domain/interfaces/IErroResponse';

export interface ICustomHttpExceptionResponse extends IErrorResponse {
  path: string;
  method: string;
  timeStamp: Date;
}
