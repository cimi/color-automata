#include <cstddef>
#include <cstdlib>
#include <ctime>
#include <emscripten/bind.h>

typedef struct {
  uint8_t r;
  uint8_t g;
  uint8_t b;
} pixel;

const int TILE_SIZE = 1024;

class Tapestry {
private:
  int width;
  int height;

  // generate tapestry in tiles
  int currentTileX = 0;
  int currentTileY = 0;

  // The image buffer handed back to JS for rendering into canvas
  // The image format that imageData expects is four unsigned bytes: red,
  // green, blue, alpha
  uint8_t buffer[TILE_SIZE * TILE_SIZE * 4];

  pixel *colorPrimary = nullptr;
  pixel *colorBuffer = nullptr;
  pixel *velocityPrimary = nullptr;
  pixel *velocityBuffer = nullptr;

  pixel *initBufferToRandomColors() {
    pixel *output = (pixel *)malloc(this->width * this->height);
    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        int addr = y * this->width + x;
        output[addr].r = std::rand() % 255 + 1;
        output[addr].g = std::rand() % 255 + 1;
        output[addr].b = std::rand() % 255 + 1;
      }
    }
    return output;
  }

  pixel *copyBufferValues(pixel *input) {
    pixel *output = (pixel *)malloc(this->width * this->height);
    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        size_t addr = y * this->width + x;
        output[addr].r = input[addr].r;
        output[addr].g = input[addr].g;
        output[addr].b = input[addr].b;
      }
    }
    return output;
  }

  pixel *initBufferToZero() {
    pixel *output = (pixel *)malloc(this->width * this->height);
    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        int addr = y * this->width + x;
        output[addr].r = 0;
        output[addr].g = 0;
        output[addr].b = 0;
      }
    }
    return output;
  }

public:
  Tapestry(int width, int height) : width(width), height(height) {
    // seed the random number generator as it drives initial state
    std::srand(std::time(0));
    this->colorPrimary = this->initBufferToRandomColors();
    // this->colorBuffer = this->copyBufferValues(this->colorPrimary);
  }

  emscripten::val nextTile() {
    if (this->currentTileY * TILE_SIZE > this->height) {
      this->currentTileY = 0;
    }

    // Generate a TILE_SIZE x TILE_SIZE array of pixels
    int startx = this->currentTileX * TILE_SIZE;
    int endx = (this->currentTileX + 1) * TILE_SIZE;
    int starty = this->currentTileY * TILE_SIZE;
    int endy = (this->currentTileY + 1) * TILE_SIZE;
    for (int y = starty; y < endy; y++) {
      for (int x = startx; x < endx; x++) {
        // copy the color values from color primary into the buffer that gets returned to JS
        size_t bufferOffset = ((x - startx) + (y - starty) * TILE_SIZE) * 4;
        size_t addr = ((x - startx) + (y - starty) * TILE_SIZE);
        this->buffer[bufferOffset + 0] = this->colorPrimary[addr].r;
        this->buffer[bufferOffset + 1] = this->colorPrimary[addr].g;
        this->buffer[bufferOffset + 2] = this->colorPrimary[addr].b;
        this->buffer[bufferOffset + 3] = 255;
      }
    }

    emscripten::val returnVal = emscripten::val::object();
    returnVal.set("data", emscripten::val(emscripten::typed_memory_view(
                              TILE_SIZE * TILE_SIZE * 4, this->buffer)));
    returnVal.set("width", emscripten::val(TILE_SIZE));
    returnVal.set("height", emscripten::val(TILE_SIZE));
    returnVal.set("x", emscripten::val(this->currentTileX * TILE_SIZE));
    returnVal.set("y", emscripten::val(this->currentTileY * TILE_SIZE));

    // Increment to the next tile
    this->currentTileX++;
    if (this->currentTileX * TILE_SIZE > this->width) {
      this->currentTileX = 0;
      this->currentTileY++;
    }

    return returnVal;
  }
};

EMSCRIPTEN_BINDINGS(hello) {
  emscripten::class_<Tapestry>("Tapestry")
      .constructor<int, int>()
      .function("nextTile", &Tapestry::nextTile);
}