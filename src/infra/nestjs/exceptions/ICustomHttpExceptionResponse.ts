import { IErrorResponse } from 'domain/types/IErroResponse';

export interface ICustomHttpExceptionResponse extends IErrorResponse {
  path: string;
  method: string;
  timeStamp: Date;
}
