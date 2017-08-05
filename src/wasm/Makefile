export EMCC_DEBUG=1

tapestry.js: tapestry.cpp
	em++ --bind --std=c++11 -O3 tapestry.cpp -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -o tapestry.js

clean:
	rm *.js *.wasm