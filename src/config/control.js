import { setupLogging } from "./logging";

export const startTapestry = config => {
  console.log("Starting animation with config ", config);
  setupLogging(config);

  let intervalId;
  if (config.implementation === "js") {
    intervalId = config.jsTapestry(config);
  } else {
    intervalId = config.wasmTapestry(config);
  }
  return intervalId;
};
