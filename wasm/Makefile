export EMCC_DEBUG=1

wasm-loader.js: color_automata.cpp
	docker run --rm -v `pwd`:/src trzeci/emscripten em++ --bind --std=c++11 -O3 color_automata.cpp \
		-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s ASSERTIONS=1 \
		-s EXPORTED_FUNCTIONS='["_create_buffer"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' -s 'EXPORT_NAME="WasmLoader"' \
		-o wasm-loader.js

../public/color-automata.wasm: wasm-loader.js
	mv wasm-loader.wasm ../public/color-automata.wasm

../src/wasm-loader.js: wasm-loader.js
	echo "/* eslint-disable */" | cat - wasm-loader.js > /tmp/out && mv /tmp/out wasm-loader.js
	mv wasm-loader.js ../src/wasm-loader.js

all: ../public/color-automata.wasm ../src/wasm-loader.js

clean:
	rm -f *.js ../public/color_automata.wasm ../src/wasm-loader.js
