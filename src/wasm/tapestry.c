#include <time.h>
#include <stdlib.h>
#include <stdio.h>
#include <emscripten.h>
#include <string.h>

int width = 0;
int height = 0;
char *current;
char *next;

typedef struct _pixel {
  unsigned char r;
  unsigned char g;
  unsigned char b;
} pixel;

pixel** colorPrimary;
pixel** colorBuffer;
pixel** velocityPrimary;
pixel** velocityBuffer;

void writeRandomColor(pixel* p) {
  // struct pixel p = {.r = rand() % 255, .g = rand() % 255, .b = rand() % 255};
  p->r = rand() % 255;
  p->g = rand() % 255;
  p->b = rand() % 255;
}

void zeroFill(pixel *p) {
  p->r = 0;
  p->g = 0;
  p->b = 0;
}

void copyPixel(pixel *src, pixel *dst) {
  dst->r = src->r;
  dst->g = src->g;
  dst->b = src->b;
}

pixel** zeroFillBuffer(int width, int height) {
  pixel** buffer = malloc(height * sizeof(pixel*));
  for (int i = 0; i < height; i++) {
    buffer[i] = malloc(width * sizeof(pixel));
    for (int j = 0; j < width; j++) {
      zeroFill(&buffer[i][j]);
    }
  }
  return buffer;
}

pixel** initBufferToRandomColors(int width, int height) {
  pixel **buffer = (pixel **) malloc(height * sizeof(pixel *));
  for (int i = 0; i < height; i++) {
    buffer[i] = (pixel *) malloc(width * sizeof(pixel));
    for (int j = 0; j < width; j++) {
      writeRandomColor(&buffer[i][j]);
    }
  }
  return buffer;
}



pixel** copyBuffer(pixel** oldBuffer, int width, int height) {
  pixel **buffer = (pixel **) malloc(height * sizeof(pixel *));
  for (int i = 0; i < height; i++) {
    buffer[i] = (pixel *) malloc(width * sizeof(pixel));
    for (int j = 0; j < width; j++) {
      copyPixel(&oldBuffer[i][j], &buffer[i][j]);
    }
  }
  return buffer;
}

EMSCRIPTEN_KEEPALIVE
pixel** init(int width, int height) {
  srand((unsigned int) time(0));
  colorPrimary = initBufferToRandomColors(width, height);
  colorBuffer = zeroFillBuffer(width, height);
  velocityPrimary = zeroFillBuffer(width, height);
  velocityBuffer = zeroFillBuffer(width, height);
  return colorPrimary;
}

EMSCRIPTEN_KEEPALIVE
int main() {
  EM_ASM(
    console.log("ok, run");
  );
  return 0;
}


// The image format that imageData expects is four unsigned bytes: red, green, blue, alpha
EMSCRIPTEN_KEEPALIVE
uint8_t *drawImage(int w, int h) {
  size_t bufferSize = w * h * 4;
  uint8_t *buffer = (uint8_t *)malloc(bufferSize);

  for (int y = 0; y < h; y++) {
    for (int x = 0; x < w; x++) {
      size_t bufferOffset = (x + y * w) * 4;
      buffer[bufferOffset + 0] = rand() % 255;
      buffer[bufferOffset + 1] = rand() % 255;
      buffer[bufferOffset + 2] = rand() % 255;
      buffer[bufferOffset + 3] = 255;
    }
  }
  return buffer;
}