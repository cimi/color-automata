import { setupLogging } from "./logging";

export const setupAutomata = config => {
  console.log("Creating new automata: ", config);
  setupLogging(config);

  return config.automataFactory();
};
