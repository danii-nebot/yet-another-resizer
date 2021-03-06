// http://stackoverflow.com/questions/22823752/creating-image-from-array-in-javascript-and-html5
export function getMockImage(width: number, height: number): HTMLImageElement {

  let buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let pos = (y * width + x) * 4; // position in buffer based on x and y
      buffer[pos] = 255;           // some R value [0, 255]
      buffer[pos + 1] = 0;           // some G value
      buffer[pos + 2] = 0;           // some B value
      buffer[pos + 3] = 255;           // set alpha channel
    }
  }

  // create off-screen canvas element
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  // create imageData object
  let idata = context.createImageData(width, height);

  // set our buffer as source
  idata.data.set(buffer);

  // update canvas with new data
  context.putImageData(idata, 0, 0);
  let dataUri = canvas.toDataURL(); // produces a PNG file

  let image = new Image();
  image.width = width;
  image.height = height;
  image.src = dataUri;
  return image;
}

// http://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
export function randomIntFromInterval(min, max): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
