import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/** Error dari microservice, dibawa ke gateway lalu diubah jadi HTTP error. */
export function rpcError(statusCode: HttpStatus, message: string | string[]): RpcException {
  return new RpcException({ statusCode, message });
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  employeeId: number | null;
  name: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
