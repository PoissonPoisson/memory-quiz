import { ServerResponse } from 'http';
import { readFile } from 'fs';
import { supplant, getAllValidesImagesDirectories, getRandomImage } from '../utils/util';
import { promisify } from 'util';
import { join } from 'path';
import { FindImageByNameGameData } from '../models/findImageByNameGameData.model';
import { uuid } from 'uuidv4';
import logger from '../utils/logger';

require('dotenv').config();

const readFileAsync = promisify(readFile)

export async function req_find_image_game (res: ServerResponse): Promise<void> {
  const gameDataPath: string = join(__dirname, '../../find_image_game_data.json');
  const gameData = new FindImageByNameGameData(gameDataPath);
  
  if (gameData.currentItem) {
    gameData.alreadyUsed.push(gameData.currentItem);
  }

  // List of item images directories
  const itemList: string[] = await getAllValidesImagesDirectories(process.env.RESOURCES);
  const itemUnusedList: string[] = itemList.filter(item => !gameData.alreadyUsed.includes(item));

  // Chek if directory was removed 
  if (gameData.rounds > itemList.length) {
    gameData.rounds = itemList.length;
  }

  // Select new random current item
  const currentItemIndex: number = Math.floor(Math.random() * itemUnusedList.length);
  gameData.currentItem = itemUnusedList[currentItemIndex];
  itemUnusedList.splice(currentItemIndex, 1);
  // Remove current item from item list
  itemList.splice(itemList.findIndex(i => i === gameData.currentItem), 1);

  // Remove old images
  gameData.imagesData.clear();

  // Collect 3 random false proposals
  const pruposedItems: string[] = [];
  for (let i = 0; i < 3; i++) {
    const index : number = Math.floor(Math.random() * itemList.length);
    pruposedItems.push(itemList[index]);
    itemList.splice(index, 1);
  }
  // Add current item in pruposed item list
  pruposedItems.splice(Math.floor(Math.random() * (pruposedItems.length + 1)), 0, gameData.currentItem);

  const dataOnPage = {
    quiz_name: process.env.QUIZ_NAME,
    name: gameData.currentItem.replace(/\_/g, ' '),
    counter: gameData.alreadyUsed.length + 1,
    rounds: process.env.ROUNDS,
    score: gameData.score,
    buttons: ''
  };

  // Generate and set images data from pruposed items
  await Promise.all(pruposedItems.map(async item => {
    gameData.imagesData.set(uuid(), (await getRandomImage(join(process.env.RESOURCES, item))));
  }));
  logger.debug('gameData images count : %d', gameData.imagesData.size);

  // Generate html content with images data
  [...gameData.imagesData.keys()].forEach((imageId, index) => {
    const content = `<div class="button"><a href="/find_image_result?selected=${imageId}"><button><img src="/image/${imageId}"/></button></a></div>`;
    dataOnPage.buttons += index % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
  });

  /*
  for(let i = 0; i < pruposedItems.length; i++) {
    const imageId: string = uuid();
    gameData.imagesData.set(imageId, (await getRandomImage(join(process.env.RESOURCES, pruposedItems[i]))));

    const content = `<div class="button"><a href="/find_image_result?selected=${imageId}"><button><img src="/image/${imageId}"/></button></a></div>`;
    dataOnPage.buttons += i % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
  }
  */

  await gameData.save(gameDataPath);

  let page: string = await readFileAsync(join(__dirname, '../views/find_image_game_page.html'), 'utf-8');
  // Generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
