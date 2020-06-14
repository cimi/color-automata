import WasmLoader from "../wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "../color-automata";

const loadImage = (src) => {
  return fetch("color-automata/" + src)
    .then((resp) => resp.blob())
    .then((blob) => createImageBitmap(blob))
    .catch((err) => console.log(err));
};

export const loadImages = (urls) => Promise.all(urls.map(loadImage));

export const load = () =>
  new Promise((resolve, reject) => {
    const wasmBinary = "color-automata/color-automata.wasm";
    WasmLoader({ locateFile: () => wasmBinary }).then((wasmModule) => {
      console.log(wasmBinary, "loaded");
      const wasmTapestry = wasmTapestryFactory(wasmModule);
      resolve({ jsTapestry, wasmTapestry });
    });
  });
