#include <cstddef>
#include <cstdlib>
#include <ctime>
#include <emscripten/bind.h>

// CSV to RGB conversion from http://stackoverflow.com/questions/3018313/
typedef struct {
  double r; // a fraction between 0 and 1
  double g; // a fraction between 0 and 1
  double b; // a fraction between 0 and 1
} rgb;

typedef struct {
  double h; // angle in degrees
  double s; // a fraction between 0 and 1
  double v; // a fraction between 0 and 1
} hsv;

typedef struct {
  unsigned char r;
  unsigned char g;
  unsigned char b;
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

public:
  Tapestry(int width, int height)
    : width(width), height(height) {}

  emscripten::val nextTile() {
    if (this->currentTileY * TILE_SIZE > this->height) {
      this->currentTileY = 0;
    }

    // Generate a TILE_SIZE x TILE_SIZE array of pixels
    for (int y = this->currentTileY * TILE_SIZE;
         y < (this->currentTileY + 1) * TILE_SIZE; y++) {
      for (int x = this->currentTileX * TILE_SIZE;
           x < (this->currentTileX + 1) * TILE_SIZE; x++) {
        // draw the pixel
        size_t bufferOffset =
            ((x - this->currentTileX * TILE_SIZE) +
             (y - this->currentTileY * TILE_SIZE) * TILE_SIZE) *
            4;
        this->buffer[bufferOffset + 0] = std::rand() % 255 + 1;
        this->buffer[bufferOffset + 1] = std::rand() % 255 + 1;
        this->buffer[bufferOffset + 2] = std::rand() % 255 + 1;
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