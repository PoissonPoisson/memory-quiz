import { join } from 'path';
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { ServerResponse } from 'http';
import { FindImageByNameGameData } from '../models/findImageByNameGameData.model';
import { FindNameByImageGameData } from '../models/findNameByImageGameData.model';
import { supplant, getAllValidesImagesDirectories } from '../utils/util';
import { ServerData } from '../models/serverData.model';
import logger from '../utils/logger';

require('dotenv').config();

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export async function req_home (res: ServerResponse): Promise<void> {
  let serverData: ServerData;
  const serverDataPath: string = join(__dirname, '../../data.json');
  try {
    serverData = JSON.parse((await readFileAsync(serverDataPath, 'utf-8')));

  } catch (e) {
    logger.error(e);
    // Set default server data values
    serverData = {
      "bestScore": 0,
      "gameCounter": 0
    };
    // Save default data
    await writeFileAsync(serverDataPath, JSON.stringify(serverData), 'utf-8');
  }

  const maxRounds = (await getAllValidesImagesDirectories(process.env.RESOURCES)).length;
  // Get valid rounds number
  const rounds: number = Math.min(Math.max(Number(process.env.ROUNDS), 0), maxRounds);
  process.env.ROUNDS = String(rounds);

  const dataOnPage = {
    quiz_name: process.env.QUIZ_NAME,
    gameCounter: serverData.gameCounter,
    bestScore: serverData.bestScore,
    // Game can't start without a valid directory
    buttons: rounds > 0
      ? '<a href="/find_name_game"><button>Find name quiz</button></a><a href="/find_image_game"><button>Find image quiz</button></a>'
      : '<span>No valid image directory was found</span>'
  };

  // Create and save clean games data for start new game
  await new FindImageByNameGameData('', rounds).save(join(__dirname, '../../find_image_game_data.json'));
  await new FindNameByImageGameData('', rounds).save(join(__dirname, '../../find_name_game_data.json'));

  let page: string = await readFileAsync(join(__dirname, '../views/home_page.html'), 'utf-8');
  // generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
