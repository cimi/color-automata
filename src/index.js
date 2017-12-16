/* eslint-disable no-unused-vars */
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

import WasmLoader from "./wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "./color-automata";
import { openConfigurationModal, startTapestry, updateConfig } from "./config";

registerServiceWorker();

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";

const addOctocat = () => {
  const octocat = document.getElementsByClassName("github-corner")[0];
  octocat.addEventListener("click", e => {
    e.preventDefault();
    openConfigurationModal();
  });
};

const state = {};
window.onload = () => {
  addOctocat();
  updateConfig({ jsTapestry: jsTapestry });

  WasmLoader({ wasmBinaryFile: "tapestry.wasm" }).then(WasmModule => {
    WasmModule.addOnPostRun(() => {
      updateConfig({ wasmTapestry: wasmTapestryFactory(WasmModule) });

      startTapestry();
    });
  });
};
