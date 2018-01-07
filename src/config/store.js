const cellSize = Math.max(5, Math.floor(window.innerWidth / 1024));

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";
const webAssemblySupported = isWebAssemblySupported();
let config = {
  implementation: webAssemblySupported ? "wasm" : "js",
  canvasId: "displayCanvas",
  debug: false,
  cellSize,
  webAssemblySupported
};

export const getConfig = () => Object.assign({}, config);

export const updateConfig = updates => {
  config = Object.assign(config, updates);
};
