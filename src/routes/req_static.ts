import { readFile } from 'fs';
import { parse } from 'url';
import { extname } from 'path';
import { promisify } from 'util';
import { IncomingMessage, ServerResponse } from 'http';
import { gameDataObject } from '../utils/util';
import { join } from 'path';

require('dotenv').config();

const readFileAsync = promisify(readFile);

export async function req_static (req: IncomingMessage, res: ServerResponse): Promise<void> {
  let type: string;
  let file: string = parse(req.url).pathname;

  switch (extname(file).toLowerCase()) {
    case '.html':
      type = 'text/html';
      file = join(__dirname, file);
      break;
    case '.css':
      type = 'text/css';
      file = join(__dirname, file);
      break;
    case '.png':
      type = 'image/png';
      file = await createImagePath(file);
      break;
    case '.jpg':
    case '.jpeg':
      type = 'image/jpeg';
      file = await createImagePath(file);
      break;
    case '.gif':
      type = 'image/gif';
      file = await createImagePath(file);
      break;
    case '.webp':
      type = 'image/webp';
      file = await createImagePath(file);
      break;
  }

  console.log('req_static : ' + file);

  try {
    let resource = await readFileAsync(file);
    res.writeHead(200, { 'Content-Type': type });
    res.write(resource);
    res.end();

  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write(`ERROR 404 : data not found (${file})`);
    res.end();
  }
};

/**
 * Generate an absolute path for the image.
 */
async function createImagePath (file: string): Promise<string> {
  const data = await readFileAsync(join(__dirname, '../../game_data.json'), 'utf-8');
  // Get game data to find the name of the item subdirectory in currentItem
  const gameData: gameDataObject = JSON.parse(data);

  // Generate absolute path
  return join(process.env.RESOURCES, gameData.currentItem, file);
};
