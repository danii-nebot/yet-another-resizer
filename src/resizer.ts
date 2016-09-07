/* *****************************************************************************
TypeScript implementation of client size image resizing and previewing before upload

References:
https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
https://gist.github.com/dcollien/312bce1270a5f511bf4a
https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
***************************************************************************** */

export class Resizer {
  // test config object
  config: any = {
    maxWidth: 300,
    thumbSize: 50,
    quality: 0.8,
    debug: true
  };

  constructor() { }

  // quick & dirty thumbnail preview
  getThumbFromImage(img): any {
    // TODO: do we even need this??
    // var canvas = document.createElement('canvas');
    // canvas.width = img.width;
    // canvas.height = img.height;
    // canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    var canvas = this.scaleAndCropThumb(img, this.config.thumbSize);
    var imageData = canvas.toDataURL('image/jpeg', this.config.quality);

    if (this.config.debug) {
      let thumb = new Image();
      thumb.src = imageData;
      return thumb;
    }
  }

  // TODO: refactor!
  scaleAndCropThumb(img, thumbSize) {
    let thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = thumbSize;
    thumbCanvas.height = thumbSize;

    let posx = Math.max(0, img.width - img.height) >> 1, // bitwise /2 and floor
      posy = Math.max(0, img.height - img.width) >> 1, // bitwise /2 and floor
      sizeScaled = Math.min(img.width, img.height);

    thumbCanvas.getContext('2d').drawImage(img,
      posx, posy,   // start from the top and left coords,
      sizeScaled, sizeScaled,   // get a square area from the source image (crop),
      0, 0,     // place the result at 0, 0 in the target canvas,
      thumbSize, thumbSize); // with as width / height (scale)

    return thumbCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  scaleImage(img, completionCallback = null): any {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    while (canvas.width >= (2 * this.config.maxWidth)) {
      canvas = this.getHalfScaleCanvas(canvas);
    }

    if (canvas.width > this.config.maxWidth) {
      canvas = this.scaleCanvasWithAlgorithm(canvas, this.config.maxWidth);
    }

    var imageData = canvas.toDataURL('image/jpeg', this.config.quality);

    if (this.config.debug) {
      let resizedImage = new Image();
      resizedImage.src = imageData;
      return resizedImage;
    }

    // TODO:
    // ???
    // this.performUpload(imageData, completionCallback);
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  scaleCanvasWithAlgorithm(canvas, maxWidth) {
    var scaledCanvas = document.createElement('canvas');

    var scale = maxWidth / canvas.width;

    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;

    var srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height);

    this.applyBilinearInterpolation(srcImgData, destImgData, scale);

    scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0);

    return scaledCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  getHalfScaleCanvas(canvas) {
    var halfCanvas = document.createElement('canvas');
    halfCanvas.width = canvas.width / 2;
    halfCanvas.height = canvas.height / 2;

    halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);

    return halfCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  applyBilinearInterpolation(srcCanvasData, destCanvasData, scale) {
    function inner(f00, f10, f01, f11, x, y) {
      var un_x = 1.0 - x;
      var un_y = 1.0 - y;
      return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
    }
    var i, j;
    var iyv, iy0, iy1, ixv, ix0, ix1;
    var idxD, idxS00, idxS10, idxS01, idxS11;
    var dx, dy;
    var r, g, b, a;
    for (i = 0; i < destCanvasData.height; ++i) {
      iyv = i / scale;
      iy0 = Math.floor(iyv);
      // Math.ceil can go over bounds
      iy1 = (Math.ceil(iyv) > (srcCanvasData.height - 1) ? (srcCanvasData.height - 1) : Math.ceil(iyv));
      for (j = 0; j < destCanvasData.width; ++j) {
        ixv = j / scale;
        ix0 = Math.floor(ixv);
        // Math.ceil can go over bounds
        ix1 = (Math.ceil(ixv) > (srcCanvasData.width - 1) ? (srcCanvasData.width - 1) : Math.ceil(ixv));
        idxD = (j + destCanvasData.width * i) * 4;
        // matrix to vector indices
        idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
        idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
        idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
        idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
        // overall coordinates to unit square
        dx = ixv - ix0;
        dy = iyv - iy0;
        // I let the r, g, b, a on purpose for debugging
        r = inner(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy);
        destCanvasData.data[idxD] = r;

        g = inner(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy);
        destCanvasData.data[idxD + 1] = g;

        b = inner(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy);
        destCanvasData.data[idxD + 2] = b;

        a = inner(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy);
        destCanvasData.data[idxD + 3] = a;
      }
    }
  }
}
