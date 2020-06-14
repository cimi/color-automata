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
  ready: false,
  startAnimation: function startAnimation(config) {
    document.body.classList.remove("loading");
    if (!config || !this.ready) return;
    if (this.automata) this.automata.pause();
    this.automata = setupAutomata(config);
    setTimeout(() => this.automata.start(), 750);
  },
};

let menu;

load().then((resources) => {
  context.wasmAutomata = resources.wasm;
  context.jsAutomata = resources.js;
  context.seedImages =
    resources.img && resources.img.length ? resources.img : undefined;
  menu = new AutomataMenu(context);
  context.ready = true;
  context.startAnimation(menu.makeConfig());
});

// setInterval(() => {
//   context.startAnimation(menu.makeConfig());
// }, 10 * 1000);

window.onresize = () => {
  if (menu && context.ready) {
    context.startAnimation(menu.makeConfig());
  }
};
