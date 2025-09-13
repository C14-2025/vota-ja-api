import { IErrorResponse } from 'types/IErroResponse';

export interface ICustomHttpExceptionResponse extends IErrorResponse {
  path: string;
  method: string;
  timeStamp: Date;
}
