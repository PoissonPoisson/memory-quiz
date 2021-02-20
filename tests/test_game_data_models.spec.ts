import { readFileSync, unlinkSync, existsSync } from 'fs';
import { expect } from 'chai';
import { FindImageByNameGameData } from '../src/find_image/findImageByNameGameData.model';
import { FindNameByImageGameData } from '../src/find_name/findNameByImageGameData.model';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    format.errors({ stack: true }),
    format.splat(),
    format.json({ space: 2 })),
    transports: [
      new transports.File({ filename: './tests/test_game_data_objects.log', level: 'info' }),
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.simple(),
          format.errors({ stack: true }),
        )
      })
    ]
});

describe('Test FindImageByNameGameData', () => {
  it('Should create json file and save data', async () => {
    const path = './tests/game_data_test.json';

    if (existsSync(path)) {
      unlinkSync(path);
    }

    expect(existsSync(path)).to.be.false;

    const gameData = new FindImageByNameGameData(path, 10);
    await gameData.save(path);

    expect(existsSync(path)).to.be.true;

    expect(gameData.imagesData).is.not.null;
    expect(gameData.imagesData instanceof Map).to.be.true;
    expect(gameData.imagesData.size).to.be.equal(0);
    expect(gameData.currentItem).to.be.null;
    expect(gameData.alreadyUsed instanceof Array).to.be.true;
    expect(gameData.alreadyUsed.length).to.be.equal(0);
    expect(gameData.rounds).to.be.equal(10);
    expect(gameData.score).to.be.equal(0);

    const sut = JSON.parse(readFileSync(path, 'utf-8'));

    expect(sut.imagesData).is.not.null;
    expect(sut.imagesData instanceof Map).to.be.false;
    expect(Object.keys(sut.imagesData).length).is.equal(0);
    expect(sut.currentItem).is.null;
    expect(gameData.alreadyUsed instanceof Array).to.be.true;
    expect(sut.alreadyUsed.length).to.be.equal(0);
    expect(sut.rounds).to.equal(10);
    expect(sut.score).to.equal(0);
  });
});

describe('Test FindNameByImageGameData', () => {
  it('Should create json file and save data', async () => {
    const path = './tests/game_data_test.json';

    if (existsSync(path)) {
      unlinkSync(path);
    }

    expect(existsSync(path)).to.be.false;

    const gameData = new FindNameByImageGameData(path, 10);
    await gameData.save(path);

    expect(existsSync(path)).to.be.true;

    expect(gameData.imagesData).is.not.null;
    expect(gameData.imagesData instanceof Map).to.be.true;
    expect(gameData.imagesData.size).to.be.equal(0);
    expect(gameData.currentItem).to.be.null;
    expect(gameData.alreadyUsed instanceof Array).to.be.true;
    expect(gameData.alreadyUsed.length).to.be.equal(0);
    expect(gameData.pruposedItems instanceof Array).to.be.true;
    expect(gameData.pruposedItems.length).to.be.equal(0);
    expect(gameData.rounds).to.be.equal(10);
    expect(gameData.score).to.be.equal(0);

    const sut = JSON.parse(readFileSync(path, 'utf-8'));

    expect(sut.imagesData).is.not.null;
    expect(sut.imagesData instanceof Map).to.be.false;
    expect(Object.keys(sut.imagesData).length).is.equal(0);
    expect(sut.currentItem).is.null;
    expect(sut.alreadyUsed instanceof Array).to.be.true;
    expect(sut.alreadyUsed.length).to.be.equal(0);
    expect(sut.pruposedItems instanceof Array).to.be.true;
    expect(sut.pruposedItems.length).to.be.equal(0);
    expect(sut.rounds).to.equal(10);
    expect(sut.score).to.equal(0);
  });
});
