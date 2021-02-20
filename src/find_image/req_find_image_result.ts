import { ServerResponse } from "http";
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { supplant } from '../common/utils/util';
import { dirname, join } from 'path';
import { FindImageByNameGameData } from './findImageByNameGameData.model';
import { ServerData } from '../common/models/serverData.model';
import { assert } from "console";
import logger from "../common/utils/logger";

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export async function req_find_image_result(res: ServerResponse, selected: string): Promise<void> {

  const gameDataPath: string = join(__dirname, '../../find_image_game_data.json');
  const gameData = new FindImageByNameGameData(gameDataPath);

  const dataOnPage: any = {
    quiz_name: process.env.QUIZ_NAME,
    name: gameData.currentItem.replace(/\_/g, ' '),
    counter: gameData.alreadyUsed.length + 1,
    rounds: process.env.ROUNDS,
  };

  const currentImagePath: string = join(process.env.RESOURCES, gameData.currentItem);
  try {
    const imagePath: string | undefined = gameData.imagesData.get(selected);
    assert(!imagePath, 'uuid not found on uuid/path map');

    if (dirname(imagePath) === currentImagePath) {
      gameData.score++;
      dataOnPage.buttons = [...gameData.imagesData.entries()].map(([itemId, itemValue], index) => {
        const content = `<div class="button"><button style="${dirname(itemValue) === currentImagePath ? 'background-color: green;' : ''}"><img src="/image/${itemId}"/></button></div>`;
        return index % 2 === 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
      }).join('');
    }
  } catch (e) {
    logger.error(e);
  }

  if (dirname(gameData.imagesData.get(selected) || '') === currentImagePath) {
    dataOnPage.buttons = [...gameData.imagesData.entries()].map(([itemId, itemValue], index) => {
      const content = `<div class="button"><button style="${dirname(itemValue) === currentImagePath ? 'background-color: green;' : ''}"><img src="/image/${itemId}"/></button></div>`;
      return index % 2 === 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
    }).join('');

  } else {
    dataOnPage.buttons = [...gameData.imagesData.entries()].map(([itemId, itemValue], index) => {
      const content = `<div class="button"><button style="${dirname(itemValue) === currentImagePath
        ? 'background-color: green;'
        : itemId === selected
          ? 'background-color: red;'
          : ''}"><img src="/image/${itemId}"/></button></div>`;
      return index % 2 === 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
    }).join('');
  }
  dataOnPage.score = gameData.score;

  const serverDataPath: string = join(__dirname, '../../data.json');
  const serverData: ServerData = JSON.parse((await readFileAsync(serverDataPath, 'utf-8')));

  if (gameData.alreadyUsed.length + 1 >= Number(process.env.ROUNDS)) {
    serverData.gameCounter++;
    if (gameData.score > serverData.bestScore) {
      serverData.bestScore = gameData.score;
    }
    dataOnPage.nextStep = `<a href="/"><button>Home page</button></a>`;
  } else {
    dataOnPage.nextStep = `<a href="/find_image_game"><button>Next</button></a>`;
  }

  await gameData.save(gameDataPath);

  await writeFileAsync(serverDataPath, JSON.stringify(serverData, null, 2), 'utf-8');

  let page = await readFileAsync(join(__dirname, './find_image_result_page.html'), 'utf-8');
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
