// console and debug settings
const noop = () => {};
const originalConsole = {
  log: console.log,
  time: console.time,
  timeEnd: console.timeEnd
};
const dummyConsole = { log: noop, time: noop, timeEnd: noop };

export const setupLogging = config =>
  // if debugging is enabled, use the console otherwise don't
  Object.assign(console, config.debug ? originalConsole : dummyConsole);
