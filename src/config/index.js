import { setupLogging } from "./logging";
import { load } from "./load";
import AutomataMenu from "./menu";

export const setupAutomata = (config) => {
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
  },
};

let menu;

load().then((resources) => {
  context.wasmAutomata = resources.wasm;
  context.jsAutomata = resources.js;
  context.seedImages = resources.img;
  menu = new AutomataMenu(context);
  context.initialized = true;
  context.startAnimation(menu.makeConfig());
});

// setInterval(() => {
//   context.startAnimation(menu.makeConfig());
// }, 10 * 1000);

window.onresize = () => {
  if (menu) {
    context.startAnimation(menu.makeConfig());
  }
};
