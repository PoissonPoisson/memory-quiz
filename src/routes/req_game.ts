import { ServerResponse } from "http";
import { writeFile, readFile, readdir } from 'fs';
import { supplant, gameDataObject, getAllValidesImagesDirectories, shuffle } from '../utils/util';
import { promisify } from 'util';
import { join } from 'path';

require('dotenv').config();

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);
const readdirAsync = promisify(readdir);

export async function req_game (res: ServerResponse): Promise<void> {
  const data: string = await readFileAsync(join(__dirname, '../../game_data.json'), 'utf-8');
  const gameData: gameDataObject = JSON.parse(data);
  
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

  gameData.currentImage = images[Math.floor(Math.random() * images.length)];

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
  await writeFileAsync(join(__dirname, '../../game_data.json'), JSON.stringify(gameData, null, 2), 'utf-8');
    
  const dataOnPage: object = {
    quiz_name: process.env.QUIZ_NAME,
    image: gameData.currentImage,
    counter: gameData.alreadyUsed.length + 1,
    rounds: process.env.ROUNDS,
    score: gameData.score,
    buttons: gameData.pruposedItems
    // Create proposals buttons with item name, show specification on README.md
      .map((item: string, index: number) => {
        const content = `<div class="button"><a href="/result?selected=${item}"><button>${item.replace(/\_/g, ' ')}</button></a></div>`;
        return index % 2 == 0 ? `<div class="buttons-line">${content}` : `${content}</div>`;
      }).join('')
  };

  let page = await readFileAsync(join(__dirname, '../views/game_page.html'), 'utf-8');
  // generate page
  page = supplant(page, dataOnPage);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(page);
  res.end();
}
