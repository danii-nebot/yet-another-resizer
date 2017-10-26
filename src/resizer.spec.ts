import * as Promise from 'bluebird';
import { Resizer } from './resizer';
import { getMockImage, randomIntFromInterval } from './testUtils';
import { customMatchers } from './testUtils/customMatchers';

const TEST_RUNS = 5;

describe('test Resizer object creation', () => {
  let resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it('should correctly instantiate the object and assign default values', () => {
    expect(resizer).toBeTruthy();
    expect(resizer.config).toBeDefined();
    expect(resizer.config.maxWidth).toBe(300);
    expect(resizer.config.thumbSize).toBe(50);
  });

  it('should correctly instantiate with config object', () => {
    resizer = new Resizer({ maxWidth: 100, thumbSize: 33 });
    expect(resizer).toBeTruthy();
    expect(resizer.config).toBeDefined();
    expect(resizer.config.maxWidth).toBe(100);
    expect(resizer.config.thumbSize).toBe(33);
  });

  it('should correctly assign config objects', () => {
    let configQualityDefault = resizer.config.quality;
    resizer.config = { test: 'test', maxWidth: 'test' };
    expect(resizer.config.test).toBe('test');
    expect(resizer.config.maxWidth).toBe('test');
    expect(resizer.config.quality).toBe(configQualityDefault);

  });
});

describe('getImageType helper function', () => {
  let resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it('should return empty string if called with `null`', () => {
    const type = resizer.getImageType(null);
    expect(type).toBe('');
  });

  it('should return empty string if called with not an image', () => {
    const type = resizer.getImageType({});
    expect(type).toBe('');
  });

  it('should return empty string if image source is not base64 data', () => {
    const type = resizer.getImageType({ src: 'a' });
    expect(type).toBe('');
  });
});

describe('test thumb error handling', () => {
  let resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it('get thumb from image should reject if no thumb size is defined', () => {
    resizer.config = { thumbSize: 0 };
    const mock = getMockImage(25, 25);
    resizer.getThumbFromImage(mock)
      .then(_ => {
        expect('we shouldnt be here').toBe(true);
      })
      .catch(err => {
        expect(err.message.indexOf('does not define thumbSize')).not.toBe(-1);
      });
  });

  it('get thumb from image should reject img hasnt a base64 source', () => {
    const parser: DOMParser = new DOMParser();
    const htmlText = '<div><img/></div>';
    const dom: Document = parser.parseFromString(htmlText, 'text/html');
    const imgs: any = dom.querySelectorAll('img');
    resizer.getThumbFromImage(imgs[0])
      .then(_ => {
        expect('we shouldnt be here').toBe(true);
      })
      .catch(err => {
        expect(err.message.indexOf('valid image')).not.toBe(-1);
      });
  });
});

describe('test resize error handling', () => {
  let resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it('get thumb from image should reject if no box size is defined', () => {
    resizer.config = { maxWidth: 0, maxHeight: 0 };
    const mock = getMockImage(25, 25);
    resizer.scaleImage(mock)
      .then(_ => {
        expect('we shouldnt be here').toBe(true);
      })
      .catch(err => {
        expect(err.message.indexOf('not define maxWidth and/or maxHeight')).not.toBe(-1);
      });
  });

  it('scale image should reject img hasnt a base64 source', () => {
    const parser: DOMParser = new DOMParser();
    const htmlText = '<div><img/></div>';
    const dom: Document = parser.parseFromString(htmlText, 'text/html');
    const imgs: any = dom.querySelectorAll('img');
    resizer.scaleImage(imgs[0])
      .then(_ => {
        expect('we shouldnt be here').toBe(true);
      })
      .catch(err => {
        expect(err.message.indexOf('valid image')).not.toBe(-1);
      });
  });

    it('scale image should reject img has not discernible type', () => {
    const parser: DOMParser = new DOMParser();
    const htmlText = '<div><img width="25" height="25" src="a" /></div>';
    const dom: Document = parser.parseFromString(htmlText, 'text/html');
    const imgs: any = dom.querySelectorAll('img');
    resizer.scaleImage(imgs[0])
      .then(_ => {
        expect('we shouldnt be here').toBe(true);
      })
      .catch(err => {
        expect(err.message.indexOf('valid image')).not.toBe(-1);
      });
  });
});

describe('test image resize algorithms', () => {
  let resizer: Resizer;

  beforeAll(() => {
    jasmine.addMatchers(customMatchers);
  });

  beforeEach(() => {
    resizer = new Resizer();
  });

  it('should correctly resize a battery of square images', (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let size = randomIntFromInterval(500, 750);
      let mock = getMockImage(size, size);
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(img.width).toBe(300);
            expect(img.height).toBe(300);
            resolve();
          }, 0);
        });
      });
    }
    Promise.all(ps)
    .then(done);
  });

  it('should never scale up when resizing any images', (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let size = randomIntFromInterval(50, 100);
      let mock = getMockImage(size, size);
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
        .then((resized) => {
          img.src = resized;
          img.onload = Promise.resolve;
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              expect(img.width).toBe(size);
              expect(img.height).toBe(size);
              resolve();
            }, 0);
          });
        });
    }
    Promise.all(ps)
      .then(done);
  });

  it('should correctly resize a battery of landscape images to fixed width', (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, width - (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(img.width).toBeWithinDelta(300, 1);
            // javascript floating point precision might be messing this up...
            expect(img.height).toBeWithinDelta(300 / scale, 2);
            resolve();
          }, 0);
        });
      });
    }
    Promise.all(ps)
    .then(done);
  });

  it('should correctly resize a battery of landscape images to fixed height', (done) => {
    resizer.config = {
      maxWidth: 0,
      maxHeight: 300
    };
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, width - (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
          img.src = resized;
          img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(img.height).toBeWithinDelta(300, 1);
            // javascript floating point precision might be messing this up...
            expect(img.width).toBeWithinDelta(300 * scale, 2);
            resolve();
          }, 0);
        });
      });
    }
    Promise.all(ps)
    .then(done);
  });

  it('should correctly resize a battery of portrait images to fixed width', (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, width + (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(img.width).toBeWithinDelta(300, 1);
            // javascript floating point precision might be messing this up...
            expect(img.height).toBeWithinDelta(300 / scale, 2);
            resolve();
          }, 0);
        });
      });
    }
    Promise.all(ps)
    .then(done);
  });

  it('should correctly resize a battery of portrait images to fixed height', (done) => {
    resizer.config = {
      maxWidth: 0,
      maxHeight: 300
    };
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, width + (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(img.height).toBeWithinDelta(300, 1);
            // javascript floating point precision might be messing this up...
            expect(img.width).toBeWithinDelta(Math.floor(300 * scale), 2);
            resolve();
          }, 0);
        });
      });
      ps.push(p);
    }
    Promise.all(ps)
    .then(done);
  });

  it('should correctly resize a battery of images of different sizes into a box', (done) => {
    resizer.config = {
      maxWidth: 300,
      maxHeight: 300
    };

    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let height = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, height);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (scale >= 1) {
              expect(img.width).toBeWithinDelta(300, 1);
              expect(img.height).toBeWithinDelta(Math.floor(300 / scale), 2);
            } else {
              expect(img.height).toBeWithinDelta(300, 1);
              expect(img.width).toBeWithinDelta(Math.floor(300 * scale), 2);
            }
            resolve();
          }, 0);
        });
      });
      ps.push(p);
    }
    Promise.all(ps)
    .then(done);
  });

  it('should correctly create thumbs from a battery of images of different sizes', (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let height = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, height);
      let img = new Image();

      let p: Promise<any> = resizer.getThumbFromImage(mock)
      .then(resized => {
        img.src = resized;
        img.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(img.width).toBe(50);
            expect(img.height).toBe(50);
            resolve();
          }, 0);
        });
      });
      ps.push(p);
    }
    Promise.all(ps)
    .then(done);
  });

  it('should correctly create thumbs from a battery of images parsed with `DomParser` `parseFromString`', (done) => {
    const ps: Array<Promise<any>> = [];
    const parser: DOMParser = new DOMParser();
    let htmlText = '<div>';
    for (let i = 0; i < 3; i++) {
      let width = randomIntFromInterval(500, 750);
      let height = randomIntFromInterval(500, 750);
      const mock = getMockImage(width, height);
      htmlText += `<img src="${mock.src}"></img>`;
    }
    htmlText += '</div>';

    const dom: Document = parser.parseFromString(htmlText, 'text/html');
    const imgs: any = dom.querySelectorAll('img');
    imgs.forEach(img => {
      let resized = new Image();
      let p: Promise<any> = resizer.getThumbFromImage(img)
      .then(data => {
        resized.src = data;
        resized.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(resized.width).toBe(50);
            expect(resized.height).toBe(50);
            resolve();
          }, 0);
        });
      });
      ps.push(p);
    });
    Promise.all(ps)
    .then(done);
  });

  it('should correctly resize from a battery of images parsed with `DomParser` `parseFromString`', (done) => {
    resizer.config = {
      maxWidth: 300
    };
    const ps: Array<Promise<any>> = [];
    const parser: DOMParser = new DOMParser();
    let htmlText = '<div>';
    for (let i = 0; i < 3; i++) {
      let width = randomIntFromInterval(500, 750);
      let height = randomIntFromInterval(500, 750);
      const mock = getMockImage(width, height);
      htmlText += `<img src="${mock.src}"></img>`;
    }
    htmlText += '</div>';

    const dom: Document = parser.parseFromString(htmlText, 'text/html');
    const imgs: any = dom.querySelectorAll('img');
    imgs.forEach(img => {
      let resized = new Image();
      let p: Promise<any> = resizer.scaleImage(img)
      .then(data => {
        resized.src = data;
        resized.onload = Promise.resolve;
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(resized.width).toBeWithinDelta(300, 1);
            resolve();
          }, 0);
        });
      });
      ps.push(p);
    });
    Promise.all(ps)
    .then(done);
  });
});
