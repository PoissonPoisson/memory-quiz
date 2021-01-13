import { readdir } from 'fs';
import { join } from 'path';
import { promisify } from 'util'; 
import logger from './logger';

const readdirAsync = promisify(readdir);

const validImageRegex: RegExp = /[\w\.]+\.(png|jpe?g|gif|webp)$/i;

/**
 * Replace markers in string with object values.
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
 * Get all directory with valid name and content.
 * @param path Directory path
 */
export async function getAllValidesImagesDirectories (path: string): Promise<string[]> {
  const validDirectories: string[] = [];
  try {
    // Get all valid subdirectories in RESOURCES directory
    // Show valid directory specification in README.md 
    const directories: string[] = (await readdirAsync(path, 'utf-8'))
      // Use 'Σ' caracter because I have a directory with this caracter :P
      .filter(directory => directory.match(/^[A-Z]\w+Σ?$/));

    for (const directory of directories) {
      // Get all content of the directory
      const directoryData: string[] = await readdirAsync(join(path, directory));
    
      // If find one or more valid image, add directory
      if (directoryData.find(data => data.match(validImageRegex))) {
        validDirectories.push(directory);
      }
    }
  } catch (e) {
    logger.error(e);
  }
  return validDirectories;
}

/**
 * Get a random image in the specified directory. 
 * @param Image directory path
 * @returns File name (joined to path)
 */
export async function getRandomImage(path: string): Promise<string> {
  try {
    const images: string[] = (await readdirAsync(path, 'utf-8'))
      .filter(item => item.match(validImageRegex));
  
    return join(path, images[Math.floor(Math.random() * images.length)]);

  } catch(e) {
    logger.error(e);
  }
  return null;
}
