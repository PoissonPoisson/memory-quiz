import { supplant, shuffle } from '../src/utils/util';
import { expect, assert } from 'chai';

describe('Test supplant function', () => {
  it('Should return "supplanted"', () => {
    const supplantMessage: string = 'supplanted';
    const supplantData: object = { marker: supplantMessage };

    let sut: string = supplant('{{marker}}', supplantData);
    expect(sut).to.be.equal(supplantMessage);

    sut = supplant('{{ marker }}', supplantData);
    expect(sut).to.be.equal(supplantMessage);

    sut = supplant('{{          marker}}', supplantData);
    expect(sut).to.be.equal(supplantMessage);
  });

  it('Should change many arguments', () => {
    const initialMessage: string = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>{{ title }}</title>
  </head>
  <body>
    <h1>{{ title }}</h1>
    <p>{{ text }}</p>
    {{ button }}
  </body>
<html>`;

    const supplantData: object = {
      title: 'Page title',
      text: 'Text into body.',
      button: '<a href="/"><button>Home Page</button></a>'
    };

    const resultMessage: string = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Page title</title>
  </head>
  <body>
    <h1>Page title</h1>
    <p>Text into body.</p>
    <a href="/"><button>Home Page</button></a>
  </body>
<html>`;

    const sut: string = supplant(initialMessage, supplantData);

    expect(sut).to.be.equal(resultMessage);
  })

  it('Should no change message', () => {
    const supplantData: object = { marker: 'supplanted' };

    let initialMessage: string = 'marker';
    let sut: string = supplant(initialMessage, supplantData);
    expect(sut).to.be.equal(initialMessage);

    initialMessage = '';
    sut = supplant(initialMessage, supplantData);
    expect(sut).to.be.equal(initialMessage);

    initialMessage = '{{ marker } }';
    sut = supplant(initialMessage, supplantData);
    expect(sut).to.be.equal(initialMessage);

    initialMessage = '{{ marker }}';

    sut = supplant(initialMessage, { otherMarker: 'supplanted' });
    expect(sut).to.be.equal(initialMessage);

    sut = supplant(initialMessage, {});
    expect(sut).to.be.equal(initialMessage);
  });

  it('Should throw error because invalid argument', () => {
    assert.throws(() => { supplant(null, { marker: 'test' }) }, Error);
    assert.throws(() => { supplant(undefined, { marker: 'test' }) }, Error);

    assert.throws(() => { supplant('{{ marker }}', null) }, Error);
    assert.throws(() => { supplant('{{ marker }}', undefined) }, Error);
  });
});

describe('Test shuffle function', () => {
  it('Should retun same array content', () => {
    const baseArray: number[] = [1, 2, 3, 4, 5];
    const sut: number[] = shuffle(baseArray);

    expect(sut.length).to.be.equal(baseArray.length);
    for (const item of baseArray) {
      expect(sut.includes(item)).to.be.true;
    }
  });
});
