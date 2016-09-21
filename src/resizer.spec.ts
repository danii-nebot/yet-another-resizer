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

  it("should correctly resize a battery of square images", () => {
    for (let i = 0; i < 10; i++) {
      let size = Math.floor((Math.random() + 1) * 15) * 100;
      let mock = getMockImage(size, size);
      let resized = resizer.scaleImage(mock);
      expect(resized.width).toBe(300);
      expect(resized.height).toBe(300);
    }
  });

  it("should correctly resize a battery of landscape images to fixed width", () => {
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width - (i + 1) * 25);
      let scale = mock.width / mock.height;
      let resized = resizer.scaleImage(mock);

      expect(resized.width).toBe(300);
      // javascript floating point precision might be messing this up...
      expect(resized.height).toBeWithinDelta(300 / scale, 1);
    }
  });

  it("should correctly resize a battery of landscape images to fixed height", () => {
    resizer.config = {
      maxWidth: 0,
      maxHeight: 300
    };

    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width - (i + 1) * 25);
      let scale = mock.width / mock.height;
      let resized = resizer.scaleImage(mock);
      expect(resized.height).toBe(300);
      // javascript floating point precision might be messing this up...
      expect(resized.width).toBeWithinDelta(300 * scale, 1);
    }
  });

  it("should correctly resize a battery of portrait images to fixed width", () => {
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width + (i + 1) * 25);
      let scale = mock.width / mock.height;
      let resized = resizer.scaleImage(mock);
      expect(resized.width).toBe(300);
      // javascript floating point precision might be messing this up...
      expect(resized.height).toBeWithinDelta(300 / scale, 1);
    }
  });

  it("should correctly resize a battery of portrait images to fixed height", () => {
    resizer.config = {
      maxWidth: 0,
      maxHeight: 300
    };

    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, width + (i + 1) * 25);
      let scale = mock.width / mock.height;
      let resized = resizer.scaleImage(mock);
      expect(resized.height).toBe(300);
      // javascript floating point precision might be messing this up...
      expect(resized.width).toBeWithinDelta(Math.floor(300 * scale), 1);
    }
  });

  it("should correctly create resize a battery of images of different sizes into a box", () => {
    resizer.config = {
      maxWidth: 300,
      maxHeight: 300
    };

    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let height = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, height);
      let scale = mock.width / mock.height;
      let resized = resizer.scaleImage(mock);
      if (scale >= 1) {
        expect(resized.width).toBe(300);
        expect(resized.height).toBeWithinDelta(Math.floor(300 / scale), 1);
      } else {
        expect(resized.height).toBe(300);
        expect(resized.width).toBeWithinDelta(Math.floor(300 * scale), 1);
      }
    }
  });

  it("should correctly create thumbs from a battery of images of different sizes", () => {
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let height = Math.floor((Math.random() + 1) * 15) * 20;
      let mock = getMockImage(width, height);
      let resized = resizer.getThumbFromImage(mock);
      expect(resized.width).toBe(50);
      expect(resized.height).toBe(50);
    }
  });
});
