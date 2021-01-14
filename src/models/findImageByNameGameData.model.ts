import { readFileSync, writeFile } from 'fs';
import { ImagesData } from './ImagesData.model';
import { promisify } from 'util';
import { default as defaultLogger } from '../utils/logger';
import { Logger } from 'winston';

const writeFileAsync = promisify(writeFile);

/**
 * Game data class for the name search by image game mode.
 */
export class FindImageByNameGameData implements ImagesData {
  private logger: Logger;

  public imagesData: Map<string, string>;
  /** Name of selected item (directory name) */
  public currentItem?: string;
  /** Array of used items (directories names) */
  public alreadyUsed: string[];
  /** Count rounds of the game */
  public rounds: number;
  /** Current score in the game */
  public score: number;

  constructor(path: string, rounds?: number, logger?: Logger) {
    this.logger = logger || defaultLogger;

    try {
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      this.imagesData = new Map<string, string>(Object.entries(data.imagesData));
      this.currentItem = data.currentItem;
      this.alreadyUsed = data.alreadyUsed;
      this.rounds = data.rounds;
      this.score = data.score;
      this.logger.debug('Data successfully deserialized in %s', FindImageByNameGameData.name);

    } catch (err) {
      this.logger.warn(err);
      this.imagesData = new Map<string, string>();
      this.currentItem = null;
      this.alreadyUsed = [];
      this.rounds = rounds || Number(process.env.ROUNDS);
      this.score = 0;
      this.logger.debug('Data successfully created in %s', FindImageByNameGameData.name);
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
          rounds: this.rounds,
          score: this.score
        }, null, 2)
        , 'utf-8');

      this.logger.debug('Data successfully saved in json in %s', FindImageByNameGameData.name);
    
    } catch (err) {
      this.logger.error(err);
    }
  }
};
