import WasmLoader from "../wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "../color-automata";

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
