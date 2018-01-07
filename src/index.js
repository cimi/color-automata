/* eslint-disable no-unused-vars */
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

import WasmLoader from "./wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "./color-automata";
import {
  openConfigurationModal,
  openWarningModal,
  startTapestry,
  updateConfig,
  getConfig
} from "./config";

registerServiceWorker();

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
  const { webAssemblySupported } = getConfig();
  if (webAssemblySupported) {
    // we wait for the wasm module to load the start the tapestry
    WasmLoader({ wasmBinaryFile: "tapestry.wasm" }).then(WasmModule => {
      WasmModule.addOnPostRun(() => {
        updateConfig({ wasmTapestry: wasmTapestryFactory(WasmModule) });

        startTapestry(getConfig());
      });
    });
  } else {
    // no wasm, so we show an alert and start the JS tapestry on dismissal
    openWarningModal();
  }
};
