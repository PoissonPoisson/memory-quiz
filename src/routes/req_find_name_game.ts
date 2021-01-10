import { ServerResponse } from "http";
import { readFile, readdir } from 'fs';
import { supplant, getAllValidesImagesDirectories, shuffle } from '../utils/util';
import { promisify } from 'util';
import { join } from 'path';
import { FindNameByImageGameData } from '../models/findNameByImageGameData.model';
import { uuid } from 'uuidv4';

require('dotenv').config();

const readFileAsync = promisify(readFile);
const readdirAsync = promisify(readdir);

export async function req_find_name_game (res: ServerResponse): Promise<void> {
  /*const data: string = await readFileAsync(join(__dirname, '../../find_name_game_data.json'), 'utf-8');
  const gameData2: gameDataObject = JSON.parse(data);*/

  const gameData = new FindNameByImageGameData(join(__dirname, '../../find_name_game_data.json'));
  
  if (gameData.currentItem) {
    gameData.alreadyUsed.push(gameData.currentItem);
  }

  // List of item images directories
  const itemList: string[] = (await getAllValidesImagesDirectories(process.env.RESOURCES));
  const itemUnusedList: string[] = itemList.filter(item => !gameData.alreadyUsed.includes(item));

  // Chek if directory was removed 
  if (gameData.rounds > itemList.length) {
    gameData.rounds = itemList.length;
  }

  // Select new random current item
  const currentItemIndex: number = Math.floor(Math.random() * itemUnusedList.length);
  gameData.currentItem = itemUnusedList[currentItemIndex];
  itemUnusedList.splice(currentItemIndex, 1);
  itemList.splice(itemList.findIndex(i => i === gameData.currentItem), 1);

  // List of images for the current item
  const images: string[] = (await readdirAsync(join(process.env.RESOURCES, gameData.currentItem), 'utf-8'))
    .filter(item => item.match(/[\w\.]+\.(png|jpe?g|gif|webp)$/i));

  // Remove old image
  gameData.imagesData.clear();
  // Add new image
  gameData.imagesData.set(uuid(), join(process.env.RESOURCES, gameData.currentItem, images[Math.floor(Math.random() * images.length)]));

  /*gameData.currentImage = images[Math.floor(Math.random() * images.length)];*/

  // Collect 4 quiz proposals
  // First is the selected object and the 3 others are chosen randomly.
  gameData.pruposedItems = [gameData.currentItem]
  for (let i = 0; i < Math.min(3, itemList.length + i); i++) {
    const index: number = Math.floor(Math.random() * itemList.length);
    gameData.pruposedItems.push(itemList[index]);
    itemList.splice(index, 1);
  }
  // Shuffles the order of the proposals
  gameData.pruposedItems = shuffle(gameData.pruposedItems);

  // Save game data
  await gameData.save(join(__dirname, '../../find_name_game_data.json'));
  /*await writeFileAsync(join(__dirname, '../../find_name_game_data.json'), JSON.stringify(gameData, null, 2), 'utf-8');*/
 
  const dataOnPage: object = {
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

  let page = await readFileAsync(join(__dirname, '../views/find_name_game_page.html'), 'utf-8');
  // generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
