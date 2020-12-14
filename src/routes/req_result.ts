import { ServerResponse } from "http";
import { ParsedUrlQuery } from "querystring";
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { supplant, gameDataObject, serverData } from '../utils/util';
import { join } from 'path';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export async function req_result (res: ServerResponse, query: ParsedUrlQuery): Promise<void> {
  let data: string = await readFileAsync(join(__dirname, '../../game_data.json'), 'utf-8');
  let gameData: gameDataObject = JSON.parse(data);

  const dataOnPage: any = {
    quiz_name: process.env.QUIZ_NAME,
    image: gameData.currentImage,
    counter: gameData.alreadyUsed.length + 1,
    rounds: process.env.ROUNDS
  };

  if (query.selected === gameData.currentItem) {
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
        : item === query.selected
          ? 'background-color: red;'
          : ''}">${item.replace(/\_/g, ' ')}</button></div>`;
      return index % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
    }).join('');
  }
  dataOnPage.score = gameData.score;

  data = await readFileAsync(join(__dirname, '../../data.json'), 'utf-8');
  const serverData: serverData = JSON.parse(data);
  
  // Show if game is finish
  if (gameData.alreadyUsed.length + 1 === Number(process.env.ROUNDS)) {
    serverData.gameCounter++;
    // Show if high score is exceeded
    if (gameData.score > serverData.bestScore) {
      serverData.bestScore = gameData.score;
    }
    dataOnPage.nextStep = `<a href="/"><button id="next-page-button">Home page</button></a>`;
  } else {
    dataOnPage.nextStep = `<a href="/game"><button id="next-page-button">Next Character</button></a>`;
  } 

  // Save game data
  await writeFileAsync(join(__dirname, '../../game_data.json'), JSON.stringify(gameData, null, 2), 'utf-8');
  // Save server data
  await writeFileAsync(join(__dirname, '../../data.json'), JSON.stringify(serverData, null, 2), 'utf-8');

  let page = await readFileAsync(join(__dirname, '../views/result_page.html'), 'utf-8');
  // Generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
