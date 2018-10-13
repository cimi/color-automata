import Stats from "stats.js";

function makeStats() {
  // poor man's run once
  if (makeStats.stats) return makeStats.stats;
  makeStats.stats = new Stats();
  return makeStats.stats;
}

let reqId;
export const showFpsCounter = enabled => {
  const stats = makeStats();
  if (enabled && !reqId) {
    document.body.appendChild(stats.dom);
    reqId = requestAnimationFrame(function loop() {
      stats.update();
      reqId = requestAnimationFrame(loop);
    });
  } else if (!enabled && reqId) {
    cancelAnimationFrame(reqId);
    reqId = undefined;
    document.body.removeChild(stats.dom);
  }
};
