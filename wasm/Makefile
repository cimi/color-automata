export EMCC_DEBUG=1

wasm-loader.js: tapestry.cpp
	em++ --bind --std=c++11 -O3 tapestry.cpp -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -o wasm-loader.js

../public/tapestry.wasm: wasm-loader.js
	mv wasm-loader.wasm ../public/tapestry.wasm

../src/wasm-loader.js: wasm-loader.js
	echo "/* eslint-disable */" | cat - wasm-loader.js > /tmp/out && mv /tmp/out wasm-loader.js
	mv wasm-loader.js ../src/wasm-loader.js

all: ../public/tapestry.wasm ../src/wasm-loader.js

clean:
	rm -f *.js ../public/tapestry.wasm ../src/wasm-loader.js
