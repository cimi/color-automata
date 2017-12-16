const scalingFactorX = Math.max(5, Math.floor(window.innerWidth / 1024));
const scalingFactorY = Math.max(5, Math.floor(window.innerHeight / 1024));

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";

let config = {
  width: Math.floor(window.innerWidth / scalingFactorX),
  height: Math.floor(window.innerHeight / scalingFactorY),
  implementation: isWebAssemblySupported() ? "wasm" : "js",
  canvasId: "displayCanvas",
  debug: false
};

export const getConfig = () => Object.assign({}, config);

const adjustTypes = config =>
  Object.assign(config, {
    width: Number(config.width),
    height: Number(config.height)
  });

export const updateConfig = updates => {
  config = adjustTypes(Object.assign(config, updates));
};
