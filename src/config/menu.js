import * as dat from "dat.gui";

import { load, loadImages } from "./load";
import { randomImage, sparseImage, scaleImage } from "./image-generators";
import { setupAutomata } from "./control";
import { showFpsCounter } from "./stats";

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";
const webAssemblySupported = isWebAssemblySupported();
const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];

const menu = {
  runtime: webAssemblySupported ? "WASM" : "JavaScript",
  showFps: false,
  showOctocat: true,
  cycleTimeMs: 1000 / 60,
  cellSize: 4, // Math.max(5, Math.floor(window.innerWidth / 1024)),
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

let seedImages;
const getConfig = () => {
  const width = Math.floor(window.innerWidth / menu.cellSize);
  const height = Math.floor(window.innerHeight / menu.cellSize);
  const images = seedImages
    ? seedImages.map(image => scaleImage(image, width, height))
    : undefined;
  const img = images ? randomFrom(images) : randomImage(width, height);
  return {
    ...menu,
    width,
    height,
    img,
    canvasId: "displayCanvas",
    debug: false,
    automataFactory: function() {
      if (menu.runtime === "WASM") {
        return wasmTapestry(this);
      } else {
        return jsTapestry(this);
      }
    }
  };
};

const startAnimation = () => {
  clearInterval(intervalId);
  const config = getConfig();
  intervalId = setupAutomata(config);
};

menu.reset = startAnimation;
menu.fullScreen = () => {
  const requestFullscreen =
    document.body.requestFullscreen ||
    document.body.msRequestFullscreen ||
    document.body.mozRequestFullScreen ||
    document.body.webkitRequestFullscreen;
  if (requestFullscreen) {
    menu.hide();
    menu.showOctocat = false;
    toggleOctocat(false);
    requestFullscreen.call(document.body);
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

gui.add(menu, "fullScreen").name("Full screen");

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

  const files = [
    // "ohbs-crop.jpg",
    // "ohbs-full.jpg",
    "carlos-cruz-diez.jpg",
    // "carlos-cruz-diez-2.jpg",
    "mondrian.jpg",
    "mondrian-2.png",
    "mondrian-3.png"
  ];
  loadImages(files).then(images => {
    seedImages = images;
    startAnimation();
  });
});

setInterval(() => {
  startAnimation();
  console.log("restarted");
}, 3 * 1000);

export { menu };
