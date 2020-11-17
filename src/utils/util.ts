import { readdir, existsSync, lstat } from 'fs';
import { join } from 'path';
import { promisify } from 'util'; 

const readdirAsync = promisify(readdir);
const lstatAsync = promisify(lstat);

/**
 * Replace markers in string with object values
 * Ex : supplant("{{ marker }}", { marker: "data" }) => "data"
 * @param content String with markers
 * @param replace Object that containt markers name and replace values
 * @returns Formated string
 */
export function supplant (message: string, replace: object): string {
  for (const [key, value] of Object.entries(replace)) {
    // Regex use global flag for check all occurences of the match
    message = message.replace(new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'g'), String(value));
  }
  return message;
}

/**
 * Type of game data.
 */
export type gameDataObject = {
  currentItem?: string,
  currentImage?: string,
  alreadyUsed: string[],
  pruposedItems: string[],
  score: number,
  rounds: number
};

/**
 * Type of server global data.
 */
export type serverData = {
  bestScore: number,
  gameCounter: number
};

/**
 * Get all directory with valid name and content.
 * @param path Directory path
 */
export async function getAllValidesImagesDirectories (path: string): Promise<string[]> {
  if (!path ||
      !existsSync(path) ||
      !(await lstatAsync(path)).isDirectory()) {
    throw new Error('Invalid RESOURCES path in environment file');
  }

  // Get all valid subdirectories in RESOURCES directory
  // Show valid directory specification in README.md 
  const directories: string[] = (await readdirAsync(path, 'utf-8'))
    .filter(directory => directory.match(/^[A-Z]\w+Σ?$/));

  const validDirectories: string[] = [];
  for (const directory of directories) {
    // get all content of the directory
    const directoryData: string[] = await readdirAsync(join(path, directory));

    // if find one or more valid image, add directory
    if (directoryData.find(data => data.match(/[\w\.]+\.(png|jpe?g|gif|webp)$/i))) {
      validDirectories.push(directory);
    }
  }

  return validDirectories;
}

/**
 * Shuffle the order of the array's elements.
 * @return New shuffled array
 */
export function shuffle (list: any[]): any[] {
  // copy list in order not to empty the list outside of the function
  const copyList = [...list];
  const randomArray: any[] = [];
  while (copyList.length > 0) {
    const index: number = Math.floor(Math.random() * copyList.length);
    randomArray.push(copyList[index]);
    copyList.splice(index, 1);
  }
  return randomArray;
}
