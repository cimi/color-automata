import WasmLoader from "../wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "../color-automata";

export const load = () =>
  new Promise((resolve, reject) => {
    WasmLoader({ wasmBinaryFile: "tapestry.wasm" }).then(WasmModule => {
      WasmModule.addOnPostRun(() => {
        resolve({
          wasmTapestry: wasmTapestryFactory(WasmModule),
          jsTapestry
        });
      });
    });
  });
