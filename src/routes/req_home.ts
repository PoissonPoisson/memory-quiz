import { join } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { ServerResponse } from 'http';
import { FindImageByNameGameData } from '../models/findImageByNameGameData.model';
import { FindNameByImageGameData } from '../models/findNameByImageGameData.model';
import { supplant, ServerData, getAllValidesImagesDirectories } from '../utils/util';

require('dotenv').config();

const readFileAsync = promisify(readFile);

export async function req_home (res: ServerResponse): Promise<void> {
  const serverData: ServerData = JSON.parse((await readFileAsync(join(__dirname, '../../data.json'), 'utf-8')));

  const maxRounds = (await getAllValidesImagesDirectories(process.env.RESOURCES)).length;
  // Get valid rounds number
  const rounds: number = Math.min(Math.max(Number(process.env.ROUNDS), 0), maxRounds);
  process.env.ROUNDS = String(rounds);

  const dataOnPage: object = {
    // Quiz name or default name
    quiz_name: process.env.QUIZ_NAME || 'Memory quiz',
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
