import { ServerResponse } from "http";
import { readFile } from 'fs';
import { supplant, getAllValidesImagesDirectories, getRandomImage } from '../common/utils/util';
import { promisify } from 'util';
import { join } from 'path';
import { FindNameByImageGameData } from './findNameByImageGameData.model';

require('dotenv').config();

const readFileAsync = promisify(readFile);

export async function req_find_name_game (res: ServerResponse): Promise<void> {
  const gameDataPath: string = join(__dirname, '../../find_name_game_data.json');
  const gameData = new FindNameByImageGameData(gameDataPath);

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

  // Remove old image
  gameData.imagesData.clear();
  // Add new image
  gameData.imagesData.set('0', (await getRandomImage(join(process.env.RESOURCES, gameData.currentItem))));

  // Collect 3 random false proposals
  gameData.pruposedItems = []
  for (let i = 0; i < Math.min(3, itemList.length + i); i++) {
    const index: number = Math.floor(Math.random() * itemList.length);
    gameData.pruposedItems.push(itemList[index]);
    itemList.splice(index, 1);
  }
  // Add current item in pruposed item list
  gameData.pruposedItems.splice(Math.floor(Math.random() * (gameData.pruposedItems.length + 1)), 0, gameData.currentItem);

  // Save game data
  await gameData.save(gameDataPath);
 
  const dataOnPage = {
    quiz_name: process.env.QUIZ_NAME,
    image: '/image/' + gameData.imagesData.keys().next().value,
    counter: gameData.alreadyUsed.length + 1,
    rounds: process.env.ROUNDS,
    score: gameData.score,
    buttons: gameData.pruposedItems
    // Create proposals buttons with item name, show specification on README.md
      .map((item: string, index: number) => {
        const content = `<div class="button"><a href="/find_name_result?selected=${item}"><button>${item.replace(/\_/g, ' ')}</button></a></div>`;
        return index % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
      }).join('')
  };

  let page = await readFileAsync(join(__dirname, './find_name_game_page.html'), 'utf-8');
  // Generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
