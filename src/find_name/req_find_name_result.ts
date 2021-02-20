import { ServerResponse } from "http";
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { supplant } from '../common/utils/util';
import { join } from 'path';
import { FindNameByImageGameData } from './findNameByImageGameData.model';
import { ServerData } from '../common/models/serverData.model';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export async function req_find_name_result (res: ServerResponse, selected: string): Promise<void> {

  const gameDataPath: string = join(__dirname, '../../find_name_game_data.json');
  const gameData = new FindNameByImageGameData(gameDataPath);

  const dataOnPage: any = {
    quiz_name: process.env.QUIZ_NAME,
    image: '/image/' + gameData.imagesData.keys().next().value,
    counter: gameData.alreadyUsed.length + 1,
    rounds: process.env.ROUNDS
  };

  if (selected === gameData.currentItem) {
    gameData.score++;
    dataOnPage.buttons = gameData.pruposedItems.map((item: string, index: number) => {
      // Create proposals response buttons with item name, show specification on README.md
      const content = `<div class="button"><button style="${item === gameData.currentItem ? 'background-color: green;' : ''}">${item.replace(/\_/g, ' ')}</button></div>`;
      return index % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
    }).join('');

  } else {
    dataOnPage.buttons = gameData.pruposedItems.map((item: string, index: number) => {
      // Create proposals response buttons with item name, show specification on README.md
      const content = `<div class="button"><button style="${item === gameData.currentItem
        ? 'background-color: green;'
        : item === selected
          ? 'background-color: red;'
          : ''}">${item.replace(/\_/g, ' ')}</button></div>`;
      return index % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
    }).join('');
  }
  dataOnPage.score = gameData.score;

  const serverDataPath: string = join(__dirname, '../../data.json');
  const serverData: ServerData = JSON.parse((await readFileAsync(serverDataPath, 'utf-8')));
  
  // Show if game is finish
  if (gameData.alreadyUsed.length + 1 >= Number(process.env.ROUNDS)) {
    serverData.gameCounter++;
    // Show if high score is exceeded
    if (gameData.score > serverData.bestScore) {
      serverData.bestScore = gameData.score;
    }
    dataOnPage.nextStep = `<a href="/"><button>Home page</button></a>`;
  } else {
    dataOnPage.nextStep = `<a href="/find_name_game"><button>Next</button></a>`;
  } 

  // Save game data
  await gameData.save(gameDataPath);
  // Save server data
  await writeFileAsync(serverDataPath, JSON.stringify(serverData, null, 2), 'utf-8');

  let page = await readFileAsync(join(__dirname, './find_name_result_page.html'), 'utf-8');
  // Generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
