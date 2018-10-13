import * as dat from "dat.gui";

import { load } from "./load";
import { startTapestry } from "./control";
import { showFpsCounter } from "./stats";

const cellSize = Math.max(5, Math.floor(window.innerWidth / 1024));
const isWebAssemblySupported = () => typeof window.WebAssembly === "object";
const webAssemblySupported = isWebAssemblySupported();

const menu = {
  runtime: webAssemblySupported ? "WASM" : "JavaScript",
  showFps: false,
  cellSize
};

let wasmTapestry;
let jsTapestry;
let intervalId;
const getConfig = () => ({
  implementation: menu.runtime === "WASM" ? "wasm" : "js",
  cellSize: menu.cellSize,
  canvasId: "displayCanvas",
  debug: menu.showFps,
  webAssemblySupported,
  wasmTapestry,
  jsTapestry
});

const startAnimation = () => {
  clearInterval(intervalId);
  const config = getConfig();
  intervalId = startTapestry(config);
};

menu.reset = startAnimation;

const gui = new dat.GUI({
  closeOnTop: true
});
dat.GUI.toggleHide();

gui
  .add(menu, "showFps")
  .name("Show FPS")
  .onChange(showFpsCounter);
gui
  .add(menu, "cellSize")
  .name("Cell size")
  .min(1)
  .max(25)
  .step(1)
  .listen();
gui
  .add(menu, "runtime", ["WASM", "JavaScript"])
  .name("Runtime")
  .listen();
gui.add(menu, "reset").name("Reset");

load().then(loaded => {
  debugger;
  wasmTapestry = loaded.wasmTapestry;
  jsTapestry = loaded.jsTapestry;
  startAnimation();
});

export { menu };
