import { Resizer } from './resizer';
import { getMockImage } from './testUtils/mock';
import { customMatchers } from './testUtils/customMatchers';

describe("test Resizer object creation", () => {
  var resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it("should correctly instantiate the object", () => {
    expect(resizer).toBeTruthy();
    expect(resizer.config).toBeDefined();
  });
});

describe("test image resize algorithms", () => {
  var resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
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

  it("should correctly resize a battery of landscape images", () => {
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 100;
      let scale = 2 * (i + 1);
      let mock = getMockImage(width, Math.floor(width / scale));
      let resized = resizer.scaleImage(mock);
      expect(resized.width).toBe(300);
      // javascript floating point precission might be messing this up...
      expect(resized.height).toBeWithinDelta(Math.floor(300 / scale), 1);
    }
  });

  it("should correctly resize a battery of portrait images", () => {
    for (let i = 0; i < 5; i++) {
      let width = Math.floor((Math.random() + 1) * 15) * 20;
      let scale = 2 * (i + 1);
      let mock = getMockImage(width, width * scale);
      let resized = resizer.scaleImage(mock);
      expect(resized.width).toBe(300);
      // javascript floating point precission might be messing this up...
      expect(resized.height).toBeWithinDelta(Math.floor(300 * scale), 1);
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