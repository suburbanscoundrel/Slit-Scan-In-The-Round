let video;
let vidx = 0;
let vidx2 = 0;
let drawMultiplier = 0;
let slitSize = 2;
let slitSize2 = 3;
let currentScreen;
let rotAngle = 0;
let radialVersion = false;
let reduceSpiral = false;
let reduceX = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  angleMode(DEGREES);
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
}

function draw() {
  if (radialVersion === false) {
    // store the slit as image var
    let slice = video.get(vidx, 0, slitSize, height);
    // dither the slit
    makeDithered(slice, 1);
    // draw slit to screen
    image(slice, vidx, 0);

    // increase x
    vidx += slitSize;
    // reset x to the begining of webcam footage
    if (vidx > video.width) {
      vidx = 0;
    }
  }

  if (radialVersion === true) {
    // store the slit as image var
    let slice = video.get(vidx2, 0, slitSize2, height);
    // dither the slit
    makeDithered(slice, 1);

    // transformations on slit
    push();
    // move slit origin to middle of screen
    translate(width/2, height/2);
    // rotate slit
    rotate(rotAngle);
    // draw slit in spirograph pattern
    image(slice, drawMultiplier, 0);

    // move slit back and forth across webcam
    if (vidx2 > video.width - slitSize2) {
      reduceX = true;
    }
    if (vidx2 < slitSize2) {
      reduceX = false;
    }

    if (reduceX === false) {
      vidx2 += 1;
    }
    if (reduceX === true) {
      vidx2 -= 1;
    }

    // increase rotation angle
    rotAngle += 1;
    if (rotAngle > 360) {
      rotAngle = 0;
    }

    // increase and decrease spiral of slit scan
    if (drawMultiplier > width/2) {
      reduceSpiral = true;
    }
    if (drawMultiplier < 0) {
      reduceSpiral = false;
    }

    if (reduceSpiral === false) {
      drawMultiplier += 2;
    }
    if (reduceSpiral === true) {
      drawMultiplier -= 2;
    }
    pop();
    }
}

function mousePressed() {
  console.log(radialVersion)
  // toggle radial version on mouse press
  if (radialVersion === true) {
    radialVersion = false;
  } else{
    radialVersion = true;
  }
}

function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
}

function getColorAtindex(img, x, y) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  let red = pix[idx];
  let green = pix[idx + 1];
  let blue = pix[idx + 2];
  let alpha = pix[idx + 3];
  return color(red, green, blue, alpha);
}

function setColorAtIndex(img, x, y, clr) {
  let idx = imageIndex(img, x, y);

  let pix = img.pixels;
  pix[idx] = red(clr);
  pix[idx + 1] = green(clr);
  pix[idx + 2] = blue(clr);
  pix[idx + 3] = alpha(clr);
}

// Finds the closest step for a given value
// The step 0 is always included, so the number of steps
// is actually steps + 1
function closestStep(max, steps, value) {
  return round(steps * value / 255) * floor(255 / steps);
}

function makeDithered(img, steps) {
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtindex(img, x, y);
      let oldR = red(clr);
      let oldG = green(clr);
      let oldB = blue(clr);
      let newR = closestStep(255, steps, oldR);
      let newG = closestStep(255, steps, oldG);
      let newB = closestStep(255, steps, oldB);

      let newClr = color(newR, newG, newB);
      setColorAtIndex(img, x, y, newClr);

      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;

      distributeError(img, x, y, errR, errG, errB);
    }
  }

  img.updatePixels();
}

function distributeError(img, x, y, errR, errG, errB) {
  addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
  addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
  addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
  addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
}

function addError(img, factor, x, y, errR, errG, errB) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
  let clr = getColorAtindex(img, x, y);
  let r = red(clr);
  let g = green(clr);
  let b = blue(clr);
  clr.setRed(r + errR * factor);
  clr.setGreen(g + errG * factor);
  clr.setBlue(b + errB * factor);

  setColorAtIndex(img, x, y, clr);
}
