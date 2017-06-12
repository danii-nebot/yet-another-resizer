import * as Promise from 'bluebird';
import { Resizer } from './resizer';
import { getMockImage, randomIntFromInterval } from './testUtils';
import { customMatchers } from './testUtils/customMatchers';

const TEST_RUNS = 10;

describe('test Resizer object creation', () => {
  var resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it('should correctly instantiate the object', () => {
    expect(resizer).toBeTruthy();
    expect(resizer.config).toBeDefined();
  });

  it('should correctly assign config objects', () => {
    let configQualityDefault = resizer.config.quality;
    resizer.config = { test: 'test', maxWidth: 'test' };
    expect(resizer.config.test).toBe('test');
    expect(resizer.config.maxWidth).toBe('test');
    expect(resizer.config.quality).toBe(configQualityDefault);

  });
});

describe('test image resize algorithms', () => {
  var resizer: Resizer;

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
        img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(img.width).toBe(300);
          expect(img.height).toBe(300);
        }, 0);
      });
    }
    Promise.all(ps)
    .then(done)
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
          img.onload = Promise.resolve
        })
        .then(() => {
          setTimeout(() => {
            expect(img.width).toBe(size);
            expect(img.height).toBe(size);
          }, 0);
        });
    }
    Promise.all(ps)
      .then(done)
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
        img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(img.width).toBeWithinDelta(300, 1);
          // javascript floating point precision might be messing this up...
          expect(img.height).toBeWithinDelta(300 / scale, 2);
        }, 0);
      });
    }
    Promise.all(ps)
    .then(done)
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
          img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(img.height).toBeWithinDelta(300, 1);
          // javascript floating point precision might be messing this up...
          expect(img.width).toBeWithinDelta(300 * scale, 2);
        }, 0);
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
        img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(img.width).toBeWithinDelta(300, 1);
          // javascript floating point precision might be messing this up...
          expect(img.height).toBeWithinDelta(300 / scale, 2);
        }, 0);
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

      let p:Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(img.height).toBeWithinDelta(300, 1);
          // javascript floating point precision might be messing this up...
          expect(img.width).toBeWithinDelta(Math.floor(300 * scale), 2);
        }, 0);
      });
      ps.push(p);
    }
    Promise.all(ps)
    .then(done)
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
        img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          if (scale >= 1) {
            expect(img.width).toBeWithinDelta(300, 1);
            expect(img.height).toBeWithinDelta(Math.floor(300 / scale), 2);
          } else {
            expect(img.height).toBeWithinDelta(300, 1);
            expect(img.width).toBeWithinDelta(Math.floor(300 * scale), 2);
          }
        }, 0);
      });
      ps.push(p)
    }
    Promise.all(ps)
    .then(done)
  });

  it('should correctly create thumbs from a battery of images of different sizes', (done) => {
    let ps:Array<Promise<any>> = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      let width = randomIntFromInterval(500, 750);
      let height = randomIntFromInterval(500, 750);
      let mock = getMockImage(width, height);
      let img = new Image();

      let p:Promise<any> = resizer.getThumbFromImage(mock)
      .then(resized => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(img.width).toBe(50);
          expect(img.height).toBe(50);
        }, 0);
      })
      ps.push(p)
    }
    Promise.all(ps)
    .then(done)
  });

  it('should correctly resize from a battery of images parsed with `DomParser` `parseFromString`', (done) => {
    resizer.config = {
      maxWidth: 300
    }
    const ps:Array<Promise<any>> = [];
    const parser:DOMParser = new DOMParser();
    let htmlText = 'div'
    for (let i = 0; i < 3; i++) {
      let width = randomIntFromInterval(500, 750);
      let height = randomIntFromInterval(500, 750);
      const mock:HTMLImageElement = getMockImage(width, height);
      htmlText += `<img src="${mock.src}"></img>`
    }
    htmlText += '</div>'

    const dom:Document = parser.parseFromString(htmlText, 'text/html')
    const imgs:any = dom.querySelectorAll('img');
    imgs.forEach(img => {
      let resized = new Image()
      let p:Promise<any> = resizer.scaleImage(img)
      .then(data => {
        resized.src = data;
        resized.onload = Promise.resolve
      })
      .then(() => {
        setTimeout(() => {
          expect(resized.width).toBeWithinDelta(300, 1);
        }, 0);
      })
      ps.push(p)
    })
    Promise.all(ps)
    .then(done)
  })
});
