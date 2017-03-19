/* *****************************************************************************
TypeScript implementation of client size image resizing and previewing before upload

References:
https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
https://gist.github.com/dcollien/312bce1270a5f511bf4a
https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
***************************************************************************** */
import * as Promise from 'bluebird';

export class Resizer {
  // test config object
  // if only maxWidth or maxHeight are present, limit that property
  // if both, fit to box size
  // private property with getter/setter prefixed with "_": https://github.com/angular/angular.io/issues/1108
  _config: any = {
    maxWidth: 300,
    thumbSize: 50,
    quality: 0.8
  };

  constructor(configParam: any = null) {
    this.config = configParam;
  }

  get config(): any {
    return this._config;
  }

  set config(configParam: any) {
    (<any>Object).assign(this._config, configParam);
  }

  createCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // quick & dirty thumbnail cut preview
  getThumbFromImage(img, imgType = 'image/png'): Promise<any> {
    if (!this.config.thumbSize) {
      return Promise.reject(new Error(`Error: getThumbFromImage ${JSON.stringify(this.config)} does not define thumbSize`))
    }
    let canvas = this.scaleAndCropThumb(img, this.config.thumbSize);
    let imageData:any = canvas.toDataURL(`${imgType}`, this.config.quality);
    return Promise.resolve(imageData);
  }

  scaleAndCropThumb(img, thumbSize) {
    let posx = Math.max(0, img.width - img.height) >> 1, // bitwise /2 and floor
      posy = Math.max(0, img.height - img.width) >> 1, // bitwise /2 and floor
      cropSize = Math.min(img.width, img.height),
      thumbCanvas = this.createCanvas(thumbSize, thumbSize);

    // TODO: scale progressively using getHalfScaleCanvas() function, if thumb quality is crap
    thumbCanvas.getContext('2d').drawImage(img,
      posx, posy,   // start from the top and left coords,
      cropSize, cropSize,   // get a square area from the source image (crop),
      0, 0,     // place the result at 0, 0 in the target canvas,
      thumbSize, thumbSize); // with as width / height (scale)

    return thumbCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  scaleImage(img, imgType = 'image/png'): any {
    let boxWidth = this.config.maxWidth || 0,
      boxHeight = this.config.maxHeight || 0,
      snapToWidth = false,
      canvas = this.createCanvas(img.width, img.height);

    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    if (!boxWidth && !boxHeight) {
      return Promise.reject(new Error(`Error: scaleImage ${JSON.stringify(this.config)} does not define maxWidth and/or maxHeight`));
    }

    let scale = 1;

    if (boxWidth && boxHeight) {
      // adjust to box
      snapToWidth = (canvas.width >= canvas.height);
    } else {
      snapToWidth = !!this.config.maxWidth;
    }

    if (snapToWidth) {
      while (canvas.width >= (2 * boxWidth)) {
        canvas = this.getHalfScaleCanvas(canvas);
      }
      scale = boxWidth / canvas.width;
    } else { // snap to height
      while (canvas.height >= (2 * boxHeight)) {
        canvas = this.getHalfScaleCanvas(canvas);
      }
      scale = boxHeight / canvas.height;
    }

    if (scale !== 1) {
      canvas = this.scaleCanvasWithAlgorithm(canvas, scale);
    }

    const imageData = canvas.toDataURL(`${imgType}`, this.config.quality);
    return Promise.resolve(imageData);
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  scaleCanvasWithAlgorithm(canvas, scale) {
    const scaledCanvas = this.createCanvas(canvas.width * scale, canvas.height * scale);
    const srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height);

    this.applyBilinearInterpolation(srcImgData, destImgData, scale);
    scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0);
    return scaledCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  getHalfScaleCanvas(canvas) {
    const halfCanvas = this.createCanvas(canvas.width / 2, canvas.height / 2);
    halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);
    return halfCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  // TODO: move to WebWorker ?
  applyBilinearInterpolation(srcCanvasData, destCanvasData, scale) {
    function inner(f00, f10, f01, f11, x, y) {
      let un_x = 1.0 - x;
      let un_y = 1.0 - y;
      return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
    }
    let iyv, iy0, iy1, ixv, ix0, ix1;
    let idxD, idxS00, idxS10, idxS01, idxS11;
    let dx, dy;
    let r, g, b, a;
    for (let i = 0; i < destCanvasData.height; ++i) {
      iyv = i / scale;
      iy0 = Math.floor(iyv);
      // Math.ceil can go over bounds
      iy1 = (Math.ceil(iyv) > (srcCanvasData.height - 1) ? (srcCanvasData.height - 1) : Math.ceil(iyv));
      for (let j = 0; j < destCanvasData.width; ++j) {
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
