import WasmLoader from "../wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "../color-automata";

const loadImage = src => {
  return fetch(src)
    .then(resp => resp.blob())
    .then(blob => createImageBitmap(blob));
};

export const loadImages = urls => Promise.all(urls.map(loadImage));

export const load = () =>
  new Promise((resolve, reject) => {
    const module = WasmLoader({ locateFile: () => "color-automata.wasm" });
    module.onRuntimeInitialized = () => {
      resolve({
        wasmTapestry: wasmTapestryFactory(module),
        jsTapestry
      });
    };
  });
