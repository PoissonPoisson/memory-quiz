import { ServerResponse } from 'http';

export function req_error (res: ServerResponse): void {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.write('SERVER ERROR');
  res.end();
}
