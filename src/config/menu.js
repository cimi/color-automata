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
  showOctocat: true,
  cycleTimeMs: 1000 / 60,
  cellSize,
  minDist: 8,
  sepNormMag: 4.0,
  ease: 0.67,
  hide: () => dat.GUI.toggleHide(),
  githubLink: () =>
    window.open("https://github.com/cimi/color-automata", "_blank")
};
// "View source on GitHub"
let wasmTapestry;
let jsTapestry;
let intervalId;
const getConfig = () => ({
  implementation: menu.runtime === "WASM" ? "wasm" : "js",
  cellSize: menu.cellSize,
  minDist: menu.minDist,
  sepNormMag: menu.sepNormMag,
  ease: menu.ease,
  canvasId: "displayCanvas",
  debug: menu.showFps,
  cycleTimeMs: menu.cycleTimeMs,
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
menu.fullScreen = () => {
  const canvas = document.body; //document.getElementById("displayCanvas");
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullScreen) {
    menu.hide();
    canvas.webkitRequestFullScreen();
  }
};

window.onresize = () => {
  if (wasmTapestry) {
    startAnimation();
  }
};

const gui = new dat.GUI({
  autoplace: false,
  width: 300
});

const basicTuning = gui.addFolder("Configuration");
basicTuning
  .add(menu, "runtime", ["WASM", "JavaScript"])
  .name("Runtime")
  .listen();
basicTuning
  .add(menu, "cellSize")
  .name("Cell size")
  .min(1)
  .max(25)
  .step(1);
basicTuning
  .add(menu, "cycleTimeMs")
  .name("Speed (ms per cycle)")
  .min(0)
  .max(100);
basicTuning.open();

const fineTuning = basicTuning.addFolder("Fine Tuning");
basicTuning.add(menu, "reset").name("Apply changes");

fineTuning.add(menu, "minDist").name("Minimum distance");
fineTuning.add(menu, "sepNormMag").name("Separation");
fineTuning.add(menu, "ease").name("Ease");

const actions = gui.addFolder("Other Actions");
actions.add(menu, "fullScreen").name("Full screen");
actions.add(menu, "hide").name("Hide menu (press 'H')");
actions
  .add(menu, "showFps")
  .name("Show FPS")
  .onChange(showFpsCounter);
actions
  .add(menu, "showOctocat")
  .name("Show github corner")
  .onChange(enabled => {
    document.getElementsByClassName("github-corner")[0].style.display = enabled
      ? "block"
      : "none";
  });
actions.add(menu, "githubLink").name("View source on GitHub");

gui.close();

load().then(loaded => {
  wasmTapestry = loaded.wasmTapestry;
  jsTapestry = loaded.jsTapestry;
  startAnimation();
});

export { menu };
