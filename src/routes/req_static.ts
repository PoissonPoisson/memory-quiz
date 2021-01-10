import { readFile } from 'fs';
import { parse } from 'url';
import { promisify } from 'util';
import {  ServerResponse } from 'http';
import { join, extname } from 'path';
import { isUuid } from 'uuidv4';
import { FindNameByImageGameData } from '../models/findNameByImageGameData.model';
import logger from '../utils/logger';

require('dotenv').config();

const readFileAsync = promisify(readFile);

export async function req_static (pathname: string, res: ServerResponse): Promise<void> {
  let type: string;
  let file: string = pathname;
  
  if (pathname.startsWith('/image/') && isUuid(pathname.split('/')[2]) ) {
    if (process.env.GAME_MODE === 'find_name') {
      file = new FindNameByImageGameData(join(__dirname, '../../find_name_game_data.json')).imagesData.get(pathname.split('/')[2]);
    }
  }

  switch (extname(file).toLowerCase()) {
    case '.html':
      type = 'text/html';
      file = join(__dirname, file);
      break;
    case '.css':
      type = 'text/css';
      file = join(__dirname, '../assets/css', file);
      break;
    case '.png':
      type = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      type = 'image/jpeg';
      break;
    case '.gif':
      type = 'image/gif';
      break;
    case '.webp':
      type = 'image/webp';
      break;
  }

  logger.info('req_static : %s', file);

  try {
    const resource = await readFileAsync(file);
    res.writeHead(200, { 'Content-Type': type });
    res.write(resource);
    res.end();

  } catch (e) {
    logger.error(e);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write(`ERROR 404 : data not found (${file})`);
    res.end();
  }
};
