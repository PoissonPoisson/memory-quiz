import { ServerResponse } from 'http';

export async function req_error (res: ServerResponse): Promise<void> {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.write('SERVER ERROR');
  res.end();
}
