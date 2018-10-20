import { setupLogging } from "./logging";
import { load, loadImages } from "./load";
import AutomataMenu from "./menu";

export const setupAutomata = config => {
  console.log("Creating new automata: ", config);
  setupLogging(config);

  return config.automataFactory();
};

const context = {
  wasmAutomata: undefined,
  jsAutomata: undefined,
  automata: undefined,
  seedImages: undefined,
  initialized: false,
  startAnimation: function startAnimation(config) {
    if (!config || !this.initialized) return;
    if (this.automata) this.automata.pause();
    this.automata = setupAutomata(config);
    setTimeout(() => this.automata.start(), 750);
  }
};

let menu = { makeConfig: () => {} };

load().then(loaded => {
  context.wasmAutomata = loaded.wasmTapestry;
  context.jsAutomata = loaded.jsTapestry;
  menu = new AutomataMenu(context);
  const files = [
    // "ohbs-crop.jpg",
    "ohbs-full.jpg"
    // "carlos-cruz-diez.jpg",
    // "carlos-cruz-diez-2.jpg",
    // "mondrian.jpg",
    // "mondrian-2.png",
    // "mondrian-3.png"
  ];
  loadImages(files).then(images => {
    context.seedImages = images;
    context.initialized = true;
    context.startAnimation(menu.makeConfig());
  });
});

setInterval(() => {
  context.startAnimation(menu.makeConfig());
}, 10 * 1000);

window.onresize = () => {
  context.startAnimation(menu.makeConfig());
};
