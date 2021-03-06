#include <cstddef>
#include <cstdlib>
#include <ctime>
#include <emscripten/bind.h>
#include <math.h>

typedef struct {
  double r;
  double g;
  double b;
} pixel;

typedef struct {
  int x;
  int y;
} pos;

class ColorAutomata {
private:
  uint8_t *imagePtr;
  int width;
  int height;
  double minDistSquare;
  double sepNormMag;
  double ease;

  pixel *colorPrimary = nullptr;
  pixel *colorBuffer = nullptr;
  pixel *velocityPrimary = nullptr;
  pixel *velocityBuffer = nullptr;

  uint8_t *outputBuffer = nullptr;

  // we've learned vectors now
  std::vector<std::vector<pos>> neighbors;

  pixel *initBuffer() {
    return (pixel *)malloc(this->width * this->height * sizeof(pixel));
  }

  uint8_t *initOutputBuffer() {
    // The image buffer handed back to JS for rendering into canvas
    // The image format that imageData expects is four unsigned bytes: red,
    // green, blue, alpha
    return (uint8_t *)malloc(this->width * this->height * 4);
  }

  pixel *initBufferToRandomColors() {
    pixel *output = this->initBuffer();
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

  pixel *initBufferFromImage() {
    pixel *output = this->initBuffer();
    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        int idx = y * this->width + x;
        output[idx].r = this->imagePtr[idx * 4];
        output[idx].g = this->imagePtr[idx * 4 + 1];
        output[idx].b = this->imagePtr[idx * 4 + 2];
        // the next one is the alpha, which we don't play with yet
      }
    }
    return output;
  }

  void copyBufferValues(pixel *input, pixel *output) {
    memcpy(output, input, this->width * this->height * sizeof(pixel));
  }

  pixel *initBufferToZero() {
    pixel *output = this->initBuffer();
    memset(output, 0, this->height * this->width);
    return output;
  }

  std::vector<pos> computeNeighbors(int x, int y) {
    std::vector<pos> neighbors;
    if (y > 0) {
      pos coords = { .x = x, .y = y - 1 };
      neighbors.push_back(coords);
    }
    if (x > 0) {
      pos coords = { .x = x - 1, .y = y };
      neighbors.push_back(coords);
    }
    if (y < this->height - 1) {
      pos coords = {.x = x, .y = y + 1};
      neighbors.push_back(coords);
    }
    if (x < this->width - 1) {
      pos coords = {.x = x + 1, .y = y };
      neighbors.push_back(coords);
    }
    return neighbors;
  }

  void initNeighbors() {
    this->neighbors.resize(this->width * this->height);
    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        this->neighbors[y * this->width + x] = this->computeNeighbors(x, y);
      }
    }
  }

  void add(pixel *a, pixel *b, pixel *result) {
    result->r = a->r + b->r;
    result->g = a->g + b->g;
    result->b = a->b + b->b;
  }

  void scale(pixel *a, double value, pixel *result) {
    result->r = a->r * value;
    result->g = a->g * value;
    result->b = a->b * value;
  }

  void subtract(pixel *a, pixel *b, pixel *result) {
    result->r = a->r - b->r;
    result->g = a->g - b->g;
    result->b = a->b - b->b;
  }

  double sumOfSquares(pixel* p) {
    return p->r * p->r + p->g * p->g + p->b * p->b;
  }

  int getOffset(int x, int y) {
    return x + y * this->width;
  }

  void fixBoundaries(int cellOffset) {
    // bounce colors off of color cube boundaries
    if (this->colorBuffer[cellOffset].r < 0) {
      this->colorBuffer[cellOffset].r = 0;
      this->velocityBuffer[cellOffset].r *= -1;
    } else if (this->colorBuffer[cellOffset].r > 255) {
      this->colorBuffer[cellOffset].r = 255;
      this->velocityBuffer[cellOffset].r *= -1;
    }

    if (this->colorBuffer[cellOffset].g < 0) {
      this->colorBuffer[cellOffset].g = 0;
      this->velocityBuffer[cellOffset].g *= -1;
    } else if (this->colorBuffer[cellOffset].g > 255) {
      this->colorBuffer[cellOffset].g = 255;
      this->velocityBuffer[cellOffset].g *= -1;
    }

    if (this->colorBuffer[cellOffset].b < 0) {
      this->colorBuffer[cellOffset].b = 0;
      this->velocityBuffer[cellOffset].b *= -1;
    } else if (this->colorBuffer[cellOffset].b > 255) {
      this->colorBuffer[cellOffset].b = 255;
      this->velocityBuffer[cellOffset].b *= -1;
    }
  }

  void debugPixelValues(int offset) {
    printf("Printing for pixel #%.2d\n", offset);
    pixel p = this->colorPrimary[offset];
    printf("Color primary %.2f %.2f %.2f\n", p.r, p.g, p.b);
    p = this->colorBuffer[offset];
    printf("Color buffer %.2f %.2f %.2f\n", p.r, p.g, p.b);
    p = this->velocityPrimary[offset];
    printf("Velocity primary %.2f %.2f %.2f\n", p.r, p.g, p.b);
    p = this->velocityBuffer[offset];
    printf("Velocity bufffer %.2f %.2f %.2f\n", p.r, p.g, p.b);
  }

  void debugPixel(char *name, pixel p) {
    printf("%s %.2f %.2f %.2f\n", name, p.r, p.g, p.b);
  }

public:
  ColorAutomata(int imageAddr, int width, int height, double minDistSquare, double sepNormMag, double ease) :
    width(width),
    height(height),
    minDistSquare(minDistSquare),
    sepNormMag(sepNormMag),
    ease(ease) {
    // seed the random number generator as it drives initial state
    std::srand(std::time(0));
    this->reset(imageAddr, width, height);
  }

  void freeBuffers() {
    free(this->colorPrimary);
    free(this->colorBuffer);
    free(this->velocityPrimary);
    free(this->velocityBuffer);
    free(this->outputBuffer);
  }

  void reset(int imageAddr, int width, int height) {
    this->imagePtr = (uint8_t*) imageAddr;
    if (this->colorPrimary != nullptr) {
      this->freeBuffers();
    }
    this->width = width;
    this->height = height;

    this->outputBuffer = this->initOutputBuffer();
    this->colorPrimary = this->initBufferFromImage();
    this->colorBuffer = this->initBuffer();
    this->copyBufferValues(this->colorPrimary, this->colorBuffer);
    this->velocityPrimary = this->initBufferToZero();
    this->velocityBuffer = this->initBufferToZero();
    initNeighbors();
  }

  void tick() {
    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        int cellOffset = getOffset(x, y);

        // compute these values based on the values of the neighbours
        pixel colorAverage = {.r = 0, .g = 0, .b = 0};
        pixel velocityAverage = {.r = 0, .g = 0, .b = 0};
        pixel sep = {.r = 0, .g = 0, .b = 0};

        for (auto neighbor : this->neighbors[cellOffset]) {
          int neighborOffset = getOffset(neighbor.x, neighbor.y);
          add(&this->colorPrimary[neighborOffset], &colorAverage, &colorAverage);
          add(&this->velocityPrimary[neighborOffset], &velocityAverage, &velocityAverage);

          pixel d = {.r = 0, .g = 0, .b = 0};
          subtract(&this->colorPrimary[cellOffset], &this->colorPrimary[neighborOffset], &d);

          if (sumOfSquares(&d) < this->minDistSquare) {
            add(&d, &sep, &sep);
          }
        }

        double f = 1.0 / this->neighbors[cellOffset].size();
        scale(&colorAverage, f, &colorAverage);
        scale(&velocityAverage, f, &velocityAverage);

        // normalize separation vector
        if ((abs(sep.r) > 0.00001) || (abs(sep.g) > 0.00001) || (abs(sep.b) > 0.00001)) {

          double length = sqrt(sumOfSquares(&sep));
          scale(&sep, this->sepNormMag / length, &sep);
        }

        // update velocity by combining separation, alignment and cohesion effects
        // change velocity only by 'ease' ratio
        this->velocityBuffer[cellOffset].r += this->ease * (sep.r + velocityAverage.r + colorAverage.r - this->colorPrimary[cellOffset].r - this->velocityBuffer[cellOffset].r);
        this->velocityBuffer[cellOffset].g += this->ease * (sep.g + velocityAverage.g + colorAverage.g - this->colorPrimary[cellOffset].g - this->velocityBuffer[cellOffset].g);
        this->velocityBuffer[cellOffset].b += this->ease * (sep.b + velocityAverage.b + colorAverage.b - this->colorPrimary[cellOffset].b - this->velocityBuffer[cellOffset].b);

        // update colors according to color velocities
        add(&this->velocityBuffer[cellOffset], &this->colorBuffer[cellOffset], &this->colorBuffer[cellOffset]);
        fixBoundaries(cellOffset);
      }
    }
    this->copyBufferValues(this->velocityBuffer, this->velocityPrimary);
    this->copyBufferValues(this->colorBuffer, this->colorPrimary);
  }

  emscripten::val fullImage() {
    // The image format that imageData expects is four unsigned bytes: red, green, blue, alpha
    int bufferSize = this->width * this->height * 4;

    for (int y = 0; y < this->height; y++) {
      for (int x = 0; x < this->width; x++) {
        // copy the color values from color primary into the buffer that gets returned to JS
        int addr = x + y * this->width;
        this->outputBuffer[addr * 4 + 0] = this->colorPrimary[addr].r;
        this->outputBuffer[addr * 4 + 1] = this->colorPrimary[addr].g;
        this->outputBuffer[addr * 4 + 2] = this->colorPrimary[addr].b;
        this->outputBuffer[addr * 4 + 3] = 255;
      }
    }

    return emscripten::val(emscripten::typed_memory_view(bufferSize, this->outputBuffer));
  }
};

EMSCRIPTEN_BINDINGS(hello) {
  emscripten::class_<ColorAutomata>("ColorAutomata")
      .constructor<int, int, int, double, double, double>()
      .function("reset", &ColorAutomata::reset)
      .function("fullImage", &ColorAutomata::fullImage)
      .function("tick", &ColorAutomata::tick);
}

extern "C" {
  uint8_t* create_buffer(int width, int height) {
    return (uint8_t*) malloc(width * height * 4 * sizeof(uint8_t));
  }
}
