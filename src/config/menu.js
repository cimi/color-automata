import * as dat from "dat.gui";
import { showFpsCounter } from "./stats";
import { randomImage, scaleImage } from "./image-generators";

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isWebAssemblySupported = () => typeof window.WebAssembly === "object";
const webAssemblySupported = isWebAssemblySupported();

const gitHubLink = "https://github.com/cimi/color-automata";
const toggleOctocat = (enabled) => {
  document.getElementsByClassName("github-corner")[0].style.display = enabled
    ? "block"
    : "none";
};

const defaults = {
  runtime: webAssemblySupported ? "WASM" : "JavaScript",
  showFps: false,
  showOctocat: true,
  fps: 60,
  cellSize: 2, // Math.max(5, Math.floor(window.innerWidth / 1024)),
  minDist: 8,
  sepNormMag: 4.0,
  ease: 0.67,
};

export default class AutomataMenu {
  constructor(context) {
    this.context = context;
    Object.assign(this, defaults);
    this.gui = makeGui(this);
  }
  reset() {
    this.context.startAnimation(this.makeConfig());
  }
  hide() {
    dat.GUI.toggleHide();
  }
  makeConfig() {
    const menu = this;
    const { seedImages, wasmAutomata, jsAutomata } = this.context;

    const width = Math.floor(window.innerWidth / menu.cellSize);
    const height = Math.floor(window.innerHeight / menu.cellSize);
    const images = seedImages
      ? seedImages.map((image) => scaleImage(image, width, height))
      : undefined;
    const img = images ? randomFrom(images) : randomImage(width, height);
    return {
      ...menu,
      width,
      height,
      img,
      canvasId: "displayCanvas",
      debug: false,
      automataFactory: function () {
        if (menu.runtime === "WASM") {
          return wasmAutomata(this);
        } else {
          return jsAutomata(this);
        }
      },
    };
  }
  gitHubLink() {
    window.open(gitHubLink, "_blank");
  }
  fullScreen() {
    const requestFullscreen =
      document.body.requestFullscreen ||
      document.body.msRequestFullscreen ||
      document.body.mozRequestFullScreen ||
      document.body.webkitRequestFullscreen;
    if (requestFullscreen) {
      this.hide();
      this.showOctocat = false;
      toggleOctocat(false);
      requestFullscreen.call(document.body);
    }
  }
}

const makeGui = (menu) => {
  const gui = new dat.GUI();

  gui.add(menu, "fullScreen").name("Full screen");

  const basicTuning = gui.addFolder("Configuration");
  basicTuning
    .add(menu, "runtime", ["WASM", "JavaScript"])
    .name("Runtime")
    .listen();
  basicTuning.add(menu, "cellSize").name("Cell size").min(1).max(25).step(1);
  basicTuning.add(menu, "fps", [1, 5, 10, 15, 30, 60]).name("Target FPS");

  // const fineTuning = basicTuning.addFolder("Fine Tuning");
  basicTuning.add(menu, "reset").name("Apply changes");

  // fineTuning.add(menu, "minDist").name("Minimum distance");
  // fineTuning.add(menu, "sepNormMag").name("Separation");
  // fineTuning.add(menu, "ease").name("Ease");

  const actions = gui.addFolder("Other Actions");
  actions.add(menu, "hide").name("Hide menu (press 'H')");
  actions.add(menu, "showFps").name("Show FPS").onChange(showFpsCounter);

  actions
    .add(menu, "showOctocat")
    .name("GitHub link")
    .onChange(toggleOctocat)
    .listen();

  gui.close();
  return gui;
};
