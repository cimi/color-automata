import { setupLogging } from "./logging";

export const startTapestry = config => {
  console.log("Starting animation with config ", config);
  Object.assign(config, {
    width: Math.floor(window.innerWidth / config.cellSize),
    height: Math.floor(window.innerHeight / config.cellSize)
  });

  setupLogging(config);

  let intervalId;
  if (config.implementation === "js") {
    intervalId = config.jsTapestry(config);
  } else {
    intervalId = config.wasmTapestry(config);
  }
  return intervalId;
};
