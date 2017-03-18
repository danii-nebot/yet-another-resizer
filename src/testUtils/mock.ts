// http://stackoverflow.com/questions/22823752/creating-image-from-array-in-javascript-and-html5
export function getMockImage(width = 640, height = 480) {

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
  let canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  // create imageData object
  let idata = ctx.createImageData(width, height);

  // set our buffer as source
  idata.data.set(buffer);

  // update canvas with new data
  ctx.putImageData(idata, 0, 0);
  let dataUri = canvas.toDataURL(); // produces a PNG file

  let image = new Image();
  image.width = width;
  image.height = height;
  image.src = dataUri;
  return image;
}
