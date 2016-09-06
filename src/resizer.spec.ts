import { Resizer } from './resizer';

describe("test Resizer object creation", () => {
  var resizer: Resizer;

  beforeEach(() => {
    resizer = new Resizer();
  });

  it("should correctly instantiate the object", () => {
    expect(resizer).toBeTruthy();
    expect(resizer.test).toBe('test');
  });
});
