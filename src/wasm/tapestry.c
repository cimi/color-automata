#include <stdlib.h>
#include <stdio.h>
#include <emscripten.h>
#include <string.h>

int width = 0;
int height = 0;
char *current;
char *next;

EMSCRIPTEN_KEEPALIVE
char *init(int w, int h) {
    width = w + 2;
    height = h + 2;
    current = malloc(width * height * sizeof(char));
    for (int i = 0; i < width * height; i++) {
      current[i] = 69;
    }
    next = malloc(width * height * sizeof(char));
    return current;
}

EMSCRIPTEN_KEEPALIVE
int main() {
  EM_ASM(
    console.log("ok, run");
  );
  return 0;
}