export EMCC_DEBUG=1

# emcc src/wasm/tapestry.c -O3 -o src/wasm/tapestry.js -s WASM=1 -Wall -s MODULARIZE=1 --minify 0

tapestry.js: tapestry.cpp
	em++ --bind --std=c++11 tapestry.cpp -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -o tapestry.js

mandelbrot.js: mandelbrot.cpp
	em++ --bind --std=c++11 mandelbrot.cpp -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -o mandelbrot.js

clean:
	rm *.js *.wasm
