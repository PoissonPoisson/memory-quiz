import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { URL } from 'url';
import logger from './common/utils/logger';

require('dotenv').config();

import { req_static } from './common/routes/req_static';
import { req_error } from './common/routes/req_error';
import { req_home } from './home/req_home';
import { req_find_name_game } from './find_name/req_find_name_game';
import { req_find_name_result } from './find_name/req_find_name_result';
import { req_find_image_game } from './find_image/req_find_image_game';
import { req_find_image_result } from './find_image/req_find_image_result';

export const server: Server = createServer( async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const request = new URL(req.url, `http://${req.headers.host}`);

  logger.info('URL : %s', req.url);

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
        await req_find_name_result(res, request.searchParams.get('selected'));
        break;
      case '/find_image_game':
        process.env.GAME_MODE = 'find_image';
        await req_find_image_game(res);
        break;
      case '/find_image_result':
        await req_find_image_result(res, request.searchParams.get('selected'));
        break;
      default:
        await req_static(request.pathname, res);
        break;
    }
  } catch (e) {
    logger.error(e);
    req_error(res);
  }
});
