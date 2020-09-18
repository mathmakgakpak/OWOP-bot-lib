import * as Canvas from "canvas";


if(!process.env.isNodeBuild) {
  Object.assign(Canvas, {
    Context2d: CanvasRenderingContext2D,
    CanvasRenderingContext2D,
    CanvasGradient,
    CanvasPattern,
    Image,
    ImageData,
    
    DOMMatrix,
    DOMPoint,
  });
  const BufferFrom = Buffer.from;
  Canvas.Context2d.prototype.toBuffer = function toBuffer() {
      return BufferFrom(this.getImageData(0, 0, this.width, this.height).data);
  }
  HTMLCanvasElement.prototype.toBuffer = function toBuffer() { // you should not use it because it is not same as node-canvas implementation
    return this.getContext("2d").toBuffer();
  }
}




function imageDataToCtx(imageData) {
  const ctx = Canvas.createCanvas(imageData.width, imageData.height).getContext("2d");
  
  ctx.putImageData(imageData, 0, 0);
  return ctx;
}
Canvas.imageDataToCtx = imageDataToCtx;



Canvas.ImageData.prototype.toCtx = function toCtx() {
  return imageDataToCtx(this);
}




Canvas.Context2d.prototype.getCtx = function getCtx(x, y, width, height) {
  return imageDataToCtx(this.getImageData(x, y, width, height));
}

const round = Math.round;


function _lerp(color1, color2, factor = 0.5) {
  return round(color1 + (color2 - color1) * factor);
}

Canvas._lerp = _lerp;
Canvas.lerp = function(color1, color2, factor = 0.5) {
  const result = new Uint8ClampedArray(3);

  for(let i = 0; i < 3; i++) result[i] = _lerp(color1[i], color2[i], factor);

  return result;
}

Object.assign(__webpack_exports__, Canvas);