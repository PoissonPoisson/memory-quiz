import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { parse, UrlWithParsedQuery } from 'url';
import logger from './utils/logger';

require('dotenv').config();

import { req_static } from './routes/req_static';
import { req_error } from './routes/req_error';
import { req_home } from './routes/req_home';
import { req_find_name_game } from './routes/req_find_name_game';
import { req_find_name_result } from './routes/req_find_name_result';

export const server: Server = createServer( async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const request: UrlWithParsedQuery = parse(req.url, true);

  logger.info('URL : %s', req.url);
  logger.info('Pathname : %s', request.pathname);

  try {
    switch (request.pathname) {
      case '/':
        await req_home(res);
        break;
      case '/find_name_game':
        process.env.GAME_MODE = 'find_name';
        await req_find_name_game(res);
        break;
      case '/find_name_result':
        await req_find_name_result(res, request.query);
        break;
      default:
        await req_static(request.pathname, res);
        break;
    }
  } catch (e) {
    logger.error(e);
    await req_error(res);
  }
});
