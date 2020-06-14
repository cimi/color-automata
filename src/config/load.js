import WasmLoader from "../wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "../color-automata";

const path = process.env.PUBLIC_URL + "/";
console.log("Resource path:", path);

async function loadWasm() {
  const wasmBinary = path + "color-automata.wasm";
  console.log("Loading", wasmBinary);
  const wasmModule = await WasmLoader({ locateFile: () => wasmBinary });
  return wasmTapestryFactory(wasmModule);
}

async function loadImage(src) {
  const resp = await fetch(path + src);
  const blob = await resp.blob();
  return createImageBitmap(blob);
}

async function loadImages() {
  const files = [
    // "ohbs-crop.jpg",
    // "ohbs-full.jpg",
    // "carlos-cruz-diez.jpg",
    // "carlos-cruz-diez-2.jpg",
    // "mondrian.jpg",
    // "mondrian-2.png",
    // "mondrian-3.png"
  ];
  return Promise.all(files.map(loadImage));
}

export async function load() {
  document.body.classList.add("loading");
  await new Promise((r) => setTimeout(r, 2000));
  return {
    wasm: await loadWasm(),
    js: jsTapestry,
    img: await loadImages(),
  };
}
