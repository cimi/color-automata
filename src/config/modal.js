import vex from "./vex";
import { setupLogging } from "./logging";
import { getConfig, updateConfig } from "./manager";

export const startTapestry = () => {
  const config = getConfig();
  console.log("Starting animation with config ", config);
  clearInterval(config.currentIntervalId);

  setupLogging(config);
  let intervalId;
  if (config.implementation === "js") {
    intervalId = config.jsTapestry(config);
  } else {
    intervalId = config.wasmTapestry(config);
  }
  updateConfig({ currentIntervalId: intervalId });
};

// TODO: configure cell size instead of choosing width and height
// that way there's no distortion and you can play better with granularity
export const openConfigurationModal = () => {
  const tapestryConfiguration = getConfig();
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
      updateConfig(data);
      startTapestry(getConfig());
    }
  });
};
