/* *****************************************************************************
TypeScript implementation of client size image resizing and previewing before upload

References:
https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
https://gist.github.com/dcollien/312bce1270a5f511bf4a
https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
***************************************************************************** */
import * as Promise from 'bluebird';

export class Resizer {
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
    this._config = {...this._config, ...configParam};
  }

  createCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  getImageType(img: any): string {
    if (img && img.src && img.src.split) {
      const data = img.src.split(';')[0];
      if (data && data.length > 3 && data.split) {
        return data.split(':')[1];
      }
    }
    return '';
  }

  isImageType(type: string): boolean {
    const typeSplit = type.split('/');
    return typeSplit[0] === 'image';
  }

  // quick & dirty thumbnail cut preview
  getThumbFromImage(_img: HTMLImageElement): Promise<any> {
    let img = _img;
    return new Promise<any>((resolve, reject) => {
      if (img.src && (!img.width || !img.height)) { // might need for img to load
        img = new Image();
        img.src = _img.src;
        img.onload = resolve;
      } else {
        return resolve();
      }
    })
    .then(() => {
      if (!this.config.thumbSize) {
        return Promise.reject(new Error(`Error: getThumbFromImage ${JSON.stringify(this.config)} does not define thumbSize`));
      }

    const imgType: string = this.getImageType(img);

    if (!this.isImageType(imgType)) {
      return Promise.reject(new Error(`Error: img src ${img.src} does not appear to be a valid image`));
    }

    let canvas = this.scaleAndCropThumb(img, this.config.thumbSize);
    let imageData: any = canvas.toDataURL(imgType, this.config.quality);
    return Promise.resolve(imageData);
    });
  }

  scaleAndCropThumb(img: any, thumbSize: number) {
    const posx = Math.max(0, img.width - img.height) >> 1; // bitwise /2 and floor
    const posy = Math.max(0, img.height - img.width) >> 1; // bitwise /2 and floor
    const cropSize = Math.min(img.width, img.height);
    const thumbCanvas = this.createCanvas(thumbSize, thumbSize);

    // TODO: scale progressively using getHalfScaleCanvas() function, if thumb quality is crap
    const context: CanvasRenderingContext2D | null = thumbCanvas.getContext('2d');
    if (context) {
      context.drawImage(img,
        posx, posy,   // start from the top and left coords,
        cropSize, cropSize,   // get a square area from the source image (crop),
        0, 0,     // place the result at 0, 0 in the target canvas,
        thumbSize, thumbSize); // with as width / height
    }
    return thumbCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  scaleImage(_img: HTMLImageElement): Promise<any> {
    let img = _img;
    return new Promise<any>((resolve, reject) => {
       if (img.src && (!img.width || !img.height)) { // might need for img to load
         img = new Image();
         img.src = _img.src;
         img.onload = resolve;
       } else {
         return resolve();
       }
    })
    .then(() => {
      if (!img.width || !img.height) {
        return Promise.reject(new Error(`Error: img src ${img.src} does not appear to be a valid image`));
      }

      const boxWidth = this.config.maxWidth || 0;
      const boxHeight = this.config.maxHeight || 0;

      if (!boxWidth && !boxHeight) {
        return Promise.reject(new Error(`Error: scaleImage ${JSON.stringify(this.config)} does not define maxWidth and/or maxHeight`));
      }

      let snapToWidth: boolean = false;
      let canvas: HTMLCanvasElement = this.createCanvas(img.width, img.height);

      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context) {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const imgType: string = this.getImageType(img);

      if (!this.isImageType(imgType)) {
        return Promise.reject(new Error(`Error: img src ${img.src} does not appear to be a valid image`));
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

      if (scale < 1) {
        canvas = this.scaleCanvasWithAlgorithm(canvas, scale);
      }

      const imageData = canvas.toDataURL(`${imgType}`, this.config.quality);
      return Promise.resolve(imageData);
    });
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  scaleCanvasWithAlgorithm(canvas: HTMLCanvasElement, scale: number) {
    const scaledCanvas = this.createCanvas(canvas.width * scale, canvas.height * scale);
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    const scaledContext: CanvasRenderingContext2D | null = scaledCanvas.getContext('2d');
    if (context && scaledContext) {
      const srcImgData = context.getImageData(0, 0, canvas.width, canvas.height);
      const destImgData = scaledContext.createImageData(scaledCanvas.width, scaledCanvas.height);
      this.applyBilinearInterpolation(srcImgData, destImgData, scale);
      scaledContext.putImageData(destImgData, 0, 0);
    }
    return scaledCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  getHalfScaleCanvas(canvas: HTMLCanvasElement) {
    const halfCanvas = this.createCanvas(canvas.width / 2, canvas.height / 2);
    const context: CanvasRenderingContext2D | null = halfCanvas.getContext('2d');
    if (context) {
      context.drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);
    }
    return halfCanvas;
  }

  // source:
  // https://github.com/rossturner/HTML5-ImageUploader/blob/master/src/main/webapp/js/ImageUploader.js
  // TODO: move to WebWorker ?
  /* tslint:disable: one-variable-per-declaration variable-name */
  applyBilinearInterpolation(srcCanvasData: any, destCanvasData: any, scale: number) {
    function inner(f00: any, f10: any, f01: any, f11: any, x: number, y: number) {
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
  /* tslint:enable: one-variable-per-declaration variable-name */
}
