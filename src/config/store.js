const scalingFactorX = Math.max(5, Math.floor(window.innerWidth / 1024));
const scalingFactorY = Math.max(5, Math.floor(window.innerHeight / 1024));

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";
const webAssemblySupported = isWebAssemblySupported();
let config = {
  width: Math.floor(window.innerWidth / scalingFactorX),
  height: Math.floor(window.innerHeight / scalingFactorY),
  implementation: webAssemblySupported ? "wasm" : "js",
  canvasId: "displayCanvas",
  debug: false,
  webAssemblySupported
};

export const getConfig = () => Object.assign({}, config);

export const updateConfig = updates => {
  config = Object.assign(config, updates);
};
