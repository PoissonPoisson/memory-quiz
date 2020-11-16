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
export function supplant (message: string, replace: any): string {
  for (const [key, value] of Object.entries(replace)) {
    message = message.replace(new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}'), String(value));
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
  const randomArray: any[] = [];
  while (list.length > 0) {
    const index: number = Math.floor(Math.random() * list.length);
    randomArray.push(list[index]);
    list.splice(index, 1);
  }
  return randomArray;
}
