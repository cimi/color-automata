import vex from "./vex";
import { setupLogging } from "./logging";
import { setupStats } from "./stats";
import { getConfig, updateConfig } from "./store";

export const startTapestry = () => {
  const config = getConfig();
  console.log("Starting animation with config ", config);
  clearInterval(config.currentIntervalId);

  setupLogging(config);
  setupStats(config);

  let intervalId;
  if (config.implementation === "js") {
    intervalId = config.jsTapestry(config);
  } else {
    intervalId = config.wasmTapestry(config);
  }
  updateConfig({ currentIntervalId: intervalId });
};

const input = (config, name, type = "number") =>
  `<input name="${name}" type="${type}" value="${config[name]}"></input>`;

const radio = (config, name, value, disabled = false) =>
  `<input name="${name}" type="radio" value="${value}" ${
    config[name] === value ? "checked" : ""
  } ${disabled === true ? "disabled" : ""} />`;

const checkbox = (config, name) =>
  `<input type="checkbox" name="${name}" value="on" ${
    config[name] === true ? "checked" : ""
  } />`;

const adjustTypes = config =>
  Object.assign(config, {
    width: Number(config.width),
    height: Number(config.height),
    debug: config.debug === "on"
  });

export const openWarningModal = () => {
  vex.dialog.alert({
    unsafeMessage: `<h4>Web assembly not supported!</h4>
    <p>Falling back to the (slower) pure JavaScript implementation.</p>`,
    callback: () => startTapestry(getConfig())
  });
};

// TODO: configure cell size instead of choosing width and height
// that way there's no distortion and you can play better with granularity
export const openConfigurationModal = () => {
  const config = getConfig();
  vex.dialog.buttons.YES.text = "Reset";
  // TODO: currently running configuration instead of description
  vex.dialog.open({
    message: `This visualisation emerges from combining a cellular automaton
    with a flocking algorithm. Tweak the settings below for different output.`,
    input: `<div id="configuration-form">
        <div class="grid-size">
          <span>Cell size</span>
          ${input(config, "height")} ${input(config, "width")}
        </div>
        <div class="implementation">
          <span>Implementation</span>
          <label>${radio(config, "implementation", "js")} JS</label>
          <label>${radio(
            config,
            "implementation",
            "wasm",
            !config.webAssemblySupported
          )} WASM</label>
        </div>
        <div class="show-fps">
          <span></span>
          <label for="debug">${checkbox(config, "debug")} Debug mode</label>
        </div>
      <p class="credits"> Inspired by <a href="http://rectangleworld.com/blog/archives/587">Rectangleworld</a>.
      More details on <a href="https://github.com/cimi/color-automata">on GitHub</a>!</p>
      </div>
    `,
    callback: data => {
      // if cancel is pressed, data is false
      if (data) {
        updateConfig(adjustTypes(data));
        startTapestry(getConfig());
      }
    }
  });
};
