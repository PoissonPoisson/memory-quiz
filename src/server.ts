import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { parse, UrlWithParsedQuery } from 'url';

require('dotenv').config();

import { req_static } from './routes/req_static';
import { req_error } from './routes/req_error';
import { req_home } from './routes/req_home';
import { req_game } from './routes/req_game';
import { req_result } from './routes/req_result';

const server: Server = createServer( async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  let request: UrlWithParsedQuery = parse(req.url, true);

	console.log(" URL : " + req.url);

  try {
    switch (request.pathname) {
      case '/':
        await req_home(res);
        break;
      case '/game':
        await req_game(res);
        break;
      case '/result':
        await req_result(res, request.query);
        break;
      default:
        await req_static(req, res);
        break;
    }
  } catch (e) {
    console.error(' ERROR : ' + e.message);
    console.error(' ERROR : ' + e.stack);
    await req_error(res);
  }
});

server.listen(Number(process.env.PORT || 5000), (error?: any) => {
  if (error) {
    console.error('Server no listening : ' + error);
  } else {
    console.log('Server listening on port ' + process.env.PORT);
  }
});
