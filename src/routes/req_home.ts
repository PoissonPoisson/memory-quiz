import { readFile, writeFile } from 'fs';
import { ServerResponse } from 'http';
import { promisify } from 'util';
import { supplant, gameDataObject, serverData, getAllValidesImagesDirectories } from '../utils/util';
import { join } from 'path';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export async function req_home (res: ServerResponse): Promise<void> {
  const data: string = await readFileAsync(join(__dirname, '../../data.json'), 'utf-8');
  const serverData: serverData = JSON.parse(data);

  if (!process.env.ROUNDS) {
    // Set default number of rounds
    process.env.ROUNDS = '10';
  }
  const maxRounds = (await getAllValidesImagesDirectories(process.env.RESOURCES)).length;
  // Get valid rounds number
  process.env.ROUNDS = String(Math.min(Math.max(Number(process.env.ROUNDS), 0), maxRounds));

  const dataOnPage: object = {
    quiz_name: process.env.QUIZ_NAME,
    gameCounter: serverData.gameCounter,
    bestScore: serverData.bestScore,
    // Game can't start without a valid directory
    button: Number(process.env.ROUNDS) > 0 ? '<a href="/game"><button>Start quiz</button></a>' : '<span>No valid image directory was found</span>' 
  };

  // Create clean game data for start new game
  const cleanGameData: gameDataObject = {
    currentItem: null,
    currentImage: null,
    alreadyUsed: [],
    pruposedItems: [],
    score: 0,
    rounds : Number(process.env.ROUNDS)
  };

  // Save game data
  await writeFileAsync(join(__dirname, '../../game_data.json'), JSON.stringify(cleanGameData, null, 2), 'utf-8');

  let page: string = await readFileAsync(join(__dirname, '../views/home_page.html'), 'utf-8');
  // generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
