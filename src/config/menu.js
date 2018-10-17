import * as dat from "dat.gui";

import { load } from "./load";
import { randomImage, sparseImage, loadImageAsync } from "./image-generators";
import { startTapestry } from "./control";
import { showFpsCounter } from "./stats";

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";
const webAssemblySupported = isWebAssemblySupported();

const menu = {
  runtime: webAssemblySupported ? "WASM" : "JavaScript",
  showFps: false,
  showOctocat: true,
  cycleTimeMs: 1000 / 60,
  cellSize: 2, // Math.max(5, Math.floor(window.innerWidth / 1024)),
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

let seedImage;
const getConfig = () => {
  const width = Math.floor(window.innerWidth / menu.cellSize);
  const height = Math.floor(window.innerHeight / menu.cellSize);
  const img = seedImage ? seedImage : sparseImage(width, height);
  return {
    implementation: menu.runtime === "WASM" ? "wasm" : "js",
    cellSize: menu.cellSize,
    width,
    height,
    img,
    minDist: menu.minDist,
    sepNormMag: menu.sepNormMag,
    ease: menu.ease,
    canvasId: "displayCanvas",
    debug: true,
    cycleTimeMs: menu.cycleTimeMs,
    webAssemblySupported,
    wasmTapestry,
    jsTapestry
  };
};

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
    menu.showOctocat = false;
    toggleOctocat(false);
    canvas.webkitRequestFullScreen();
  }
};

menu.customSeed = () => {
  const url = "london-skyline.jpg";
  const { width, height } = getConfig();
  loadImageAsync(url, width, height).then(image => {
    seedImage = image;
    startAnimation();
  });
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

gui.add(menu, "fullScreen").name("Full screen");
gui.add(menu, "customSeed").name("Custom seed");

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

// const fineTuning = basicTuning.addFolder("Fine Tuning");
basicTuning.add(menu, "reset").name("Apply changes");

// fineTuning.add(menu, "minDist").name("Minimum distance");
// fineTuning.add(menu, "sepNormMag").name("Separation");
// fineTuning.add(menu, "ease").name("Ease");

const actions = gui.addFolder("Other Actions");
actions.add(menu, "hide").name("Hide menu (press 'H')");
actions
  .add(menu, "showFps")
  .name("Show FPS")
  .onChange(showFpsCounter);

const toggleOctocat = enabled => {
  document.getElementsByClassName("github-corner")[0].style.display = enabled
    ? "block"
    : "none";
};
actions
  .add(menu, "showOctocat")
  .name("Show github corner")
  .onChange(toggleOctocat)
  .listen();
actions.add(menu, "githubLink").name("View source on GitHub");

gui.close();

load().then(loaded => {
  wasmTapestry = loaded.wasmTapestry;
  jsTapestry = loaded.jsTapestry;

  const mondrian = "mondrian.jpg";
  const mondrian2 = "mondrian-2.png";
  const mondrian3 = "mondrian-3.png";
  const londonSkyline = "london-skyline.jpg";
  const { width, height } = getConfig();
  loadImageAsync(mondrian3, width, height).then(image => {
    seedImage = image;
    startAnimation();
  });
});

export { menu };
