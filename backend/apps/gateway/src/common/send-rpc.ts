import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

/** Kirim pesan ke microservice dan ubah error RPC menjadi HTTP error. */
export async function sendRpc<T = any>(client: ClientProxy, pattern: string, data: unknown): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data).pipe(timeout(10_000)));
  } catch (err: any) {
    if (err?.statusCode) throw new HttpException(err.message, err.statusCode);
    Logger.error(`RPC ${pattern} gagal: ${err?.message ?? err}`, 'Gateway');
    throw new HttpException('Service sedang tidak tersedia', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
