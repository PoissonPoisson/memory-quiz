import { readFileSync, writeFile } from 'fs';
import { ImagesData } from './ImagesData.model';
import { promisify } from 'util';
import { Logger } from 'winston';
import { default as defaultLogger } from '../utils/logger';

const writeFileAsync = promisify(writeFile);

/**
 * Game data class for the name search by image game mode.
 */
export class FindNameByImageGameData implements ImagesData {
  private logger: Logger;

  public imagesData: Map<string, string>;
  /** Name of selected item (directory name) */
  public currentItem?: string;
  /** Array of used items (directories names) */
  public alreadyUsed: string[];
  /** Array of current pruposed items (directories names), must not be already use */
  public pruposedItems: string[];
  /** Current score in the game */
  public score: number;
  /** Count rounds of the game */
  public rounds: number;

  constructor(path: string, rounds?: number, logger?: Logger) {
    this.logger = logger || defaultLogger;
    try {
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      this.imagesData = new Map<string, string>(Object.entries(data.imagesData));
      this.currentItem = data.currentItem;
      this.alreadyUsed = data.alreadyUsed;
      this.pruposedItems = data.pruposedItems;
      this.score = data.score;
      this.rounds = data.rounds;
      this.logger.info('Data successfully deserialized in %s', FindNameByImageGameData.name);

    } catch (err) {
      this.logger.warn(err);
      this.imagesData = new Map<string, string>();
      this.currentItem = null;
      this.alreadyUsed = [];
      this.pruposedItems = [];
      this.score = 0;
      this.rounds = rounds || 10;
      this.logger.info('Data successfully created in %s', FindNameByImageGameData.name);
    }
  }

  /**
   * Save game data on json file.
   * @param path Json filename
   */
  async save(path: string): Promise<void> {
    try {
      await writeFileAsync(
        path,
        JSON.stringify({
          imagesData: [...this.imagesData.entries()].reduce((o, [k, v]) => (Object.assign(o, { [k]: v })), {}),
          currentItem: this.currentItem,
          alreadyUsed: this.alreadyUsed,
          pruposedItems: this.pruposedItems,
          rounds: this.rounds,
          score: this.score
        }, null, 2)
        , 'utf-8');

      this.logger.info('Data successfully saved in json in %s', FindNameByImageGameData.name);
    
    } catch (err) {
      this.logger.error(err);
    }
  }
};
