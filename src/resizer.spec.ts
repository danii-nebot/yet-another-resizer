import * as Promise from 'bluebird';
import { Resizer } from './resizer';
import { getMockImage } from './testUtils/mock';
import { customMatchers } from './testUtils/customMatchers';

describe("test Resizer object creation", () => {
  var resizer: Resizer;

  beforeEach(() => {
    // tests are not async
    resizer = new Resizer({ test: true });
  });

  it("should correctly instantiate the object", () => {
    expect(resizer).toBeTruthy();
    expect(resizer.config).toBeDefined();
  });

  it("should correctly assign config objects", () => {
    let configQualityDefault = resizer.config.quality;
    resizer.config = { test: 'test', maxWidth: 'test' };
    expect(resizer.config.test).toBe('test');
    expect(resizer.config.maxWidth).toBe('test');
    expect(resizer.config.quality).toBe(configQualityDefault);

  });
});

describe("test image resize algorithms", () => {
  var resizer: Resizer;

  beforeEach(() => {
    // tests are not async
    resizer = new Resizer({ test: true });
    jasmine.addMatchers(customMatchers);
  });

  it("should correctly resize a battery of square images", (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < 10; i++) {
      let size = Math.floor((Math.random() + 1) * 15) * 100;
      let mock = getMockImage(size, size);
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        expect(img.width).toBe(300);
        expect(img.height).toBe(300);
      });
    }
    Promise.all(ps)
    .then(done)
  });

  it("should correctly resize a battery of landscape images to fixed width", (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width - (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        expect(img.width).toBe(300);
        // javascript floating point precision might be messing this up...
        expect(img.height).toBeWithinDelta(300 / scale, 1);
      });
    }
    Promise.all(ps)
    .then(done)
  });

  it("should correctly resize a battery of landscape images to fixed height", (done) => {
    resizer.config = {
      maxWidth: 0,
      maxHeight: 300
    };
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width - (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
          img.src = resized;
          img.onload = Promise.resolve
      })
      .then(() => {
        expect(img.height).toBe(300);
        // javascript floating point precision might be messing this up...
        expect(img.width).toBeWithinDelta(300 * scale, 1);
      });
    }
    Promise.all(ps)
    .then(done);
  });

  it("should correctly resize a battery of portrait images to fixed width", (done) => {
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width + (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        expect(img.width).toBe(300);
        // javascript floating point precision might be messing this up...
        expect(img.height).toBeWithinDelta(300 / scale, 1);
      });
    }
    Promise.all(ps)
    .then(done);
  });

  it("should correctly resize a battery of portrait images to fixed height", (done) => {
    resizer.config = {
      maxWidth: 0,
      maxHeight: 300
    };
    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width + (i + 1) * 25);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p:Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        expect(img.height).toBe(300);
        // javascript floating point precision might be messing this up...
        expect(img.width).toBeWithinDelta(Math.floor(300 * scale), 1);
      });
      ps.push(p);
    }
    Promise.all(ps)
    .then(done)
  });

  it("should correctly create resize a battery of images of different sizes into a box", (done) => {
    resizer.config = {
      maxWidth: 300,
      maxHeight: 300
    };

    let ps: Array<Promise<any>> = [];
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let height = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, height);
      let scale = mock.width / mock.height;
      let img = new Image();

      let p: Promise<any> = resizer.scaleImage(mock)
      .then((resized) => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        if (scale >= 1) {
          expect(img.width).toBe(300);
          expect(img.height).toBeWithinDelta(Math.floor(300 / scale), 1);
        } else {
          expect(img.height).toBe(300);
          expect(img.width).toBeWithinDelta(Math.floor(300 * scale), 1);
        }
      });
      ps.push(p)
    }
    Promise.all(ps)
    .then(done)
  });

  it("should correctly create thumbs from a battery of images of different sizes", (done) => {
    let ps:Array<Promise<any>> = [];
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let height = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, height);
      let img = new Image();

      let p:Promise<any> = resizer.getThumbFromImage(mock)
      .then(resized => {
        img.src = resized;
        img.onload = Promise.resolve
      })
      .then(() => {
        expect(img.width).toBe(50);
        expect(img.height).toBe(50);
      })
      ps.push(p)
    }
    Promise.all(ps)
    .then(done)
  });
});
