/* eslint-disable no-unused-vars */
import vex from "./vex";

import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

import WasmLoader from "./wasm-loader";
import { wasmTapestryFactory, jsTapestry } from "./color-automata";

// registerServiceWorker();

// console and debug settings
const noop = () => {};
const originalConsole = {
  log: console.log,
  time: console.time,
  timeEnd: console.timEnd
};
const dummyConsole = { log: noop, time: noop, timeEnd: noop };

const isWebAssemblySupported = () => typeof window.WebAssembly === "object";

const scalingFactorX = Math.max(5, Math.floor(window.innerWidth / 1024));
const scalingFactorY = Math.max(5, Math.floor(window.innerHeight / 1024));
const tapestryConfiguration = {
  width: Math.floor(window.innerWidth / scalingFactorX),
  height: Math.floor(window.innerHeight / scalingFactorY),
  implementation: isWebAssemblySupported() ? "wasm" : "js",
  canvasId: "displayCanvas",
  debug: false
};

// TODO: configure cell size instead of choosing width and height
// that way there's no distortion and you can play better with granularity

const openConfigurationModal = () => {
  vex.dialog.buttons.YES.text = "Reset";
  // TODO: currently running configuration instead of description
  vex.dialog.open({
    message: `You are looking at a combination between a cellular automaton and a flocking algorithm that yields a color tapestry.
      Use the controls below to reset the tapestry to a different configuration.`,
    input: `<div id="configuration-form">
        <div class="grid-size">
          <span>Cell size</span>
          <input name="height" type="number" value="${
            tapestryConfiguration.height
          }"></input>
          <input name="width" type="number" value="${
            tapestryConfiguration.width
          }"></input>
        </div>
        <div class="implementation">
          <span>Implementation</span>
          <label><input type="radio" name="implementation" value="js" ${
            tapestryConfiguration.implementation === "js" ? "checked" : ""
          } />JS</label>
          <label><input type="radio" name="implementation" value="wasm" ${
            tapestryConfiguration.implementation === "wasm" ? "checked" : ""
          } />WASM</label>
        </div>
        <div class="show-fps">
          <span></span>
          <label for="debug"><input type="checkbox" name="debug" ${
            tapestryConfiguration.debug ? "checked" : ""
          } />Console debugging</label>
        </div>
      <p class="credits"> Inspired by <a href="http://rectangleworld.com/blog/archives/587">Rectangleworld</a>.
      More details on <a href="https://github.com/cimi/color-automata">on GitHub</a>!</p>
      </div>
    `,
    callback: data => {
      startTapestry(updateConfig(data), state);
    }
  });
};

const updateConfig = data =>
  adjustTypes(Object.assign({}, tapestryConfiguration, data));

const adjustTypes = config =>
  Object.assign(config, {
    width: Number(config.width),
    height: Number(config.height)
  });

const setupLogging = configuration =>
  // if debugging is enabled, use the console otherwise don't
  Object.assign(console, configuration.debug ? originalConsole : dummyConsole);

const startTapestry = (configuration, state) => {
  clearInterval(state.currentIntervalId);

  setupLogging(configuration);

  if (configuration.implementation === "js") {
    jsTapestry(configuration, state);
  } else {
    state.wasmTapestry(configuration, state);
  }
};

const state = {};
window.onload = () => {
  WasmLoader({ wasmBinaryFile: "tapestry.wasm" }).then(WasmModule => {
    WasmModule.addOnPostRun(() => {
      state.wasmTapestry = wasmTapestryFactory(WasmModule);

      const octocat = document.getElementsByClassName("github-corner")[0];
      octocat.addEventListener("click", e => {
        e.preventDefault();
        openConfigurationModal();
      });

      startTapestry(tapestryConfiguration, state);
    });
  });
};
