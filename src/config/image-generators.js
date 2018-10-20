function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomImage = (width, height) => {
  let buffer = [];
  for (let i = 0; i < width * height; i++) {
    for (let j = 0; j <= 2; j++) {
      buffer[4 * i + j] = randomInt(0, 255);
    }
    buffer[4 * i + 3] = 0;
  }
  return new ImageData(new Uint8ClampedArray(buffer), width, height);
};

export const blankImage = (width, height) => {
  const buffer = new Uint8Array(4 * width * height);
  buffer.fill(0, 0, buffer.length);
  return new ImageData(new Uint8ClampedArray(buffer), width, height);
};

export const sparseImage = (width, height) => {
  let buffer = [];
  for (let i = 0; i < width * height; i++) {
    if (randomInt(0, 255) >= 128) {
      for (let j = 0; j <= 2; j++) {
        buffer[4 * i + j] = 255;
      }
      buffer[4 * i + 3] = 0;
    } else {
      for (let j = 0; j <= 2; j++) {
        buffer[4 * i + j] = randomInt(0, 255);
      }
      buffer[4 * i + 3] = 0;
    }
  }
  return new ImageData(new Uint8ClampedArray(buffer), width, height);
};

export const scaleImage = (img, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // Draw image onto canvas
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};
