import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import Counter from './wasm/counter';

const WebAssembly = window.WebAssembly;

// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const wasmHelloWorld = () => {
  console.dir(Counter);
  const memory = new WebAssembly.Memory({initial: 256});
  const counter = new Counter({
    env: {
      memoryBase: 0,
      tableBase: 0,
      memory,
      table: new WebAssembly.Table({initial: 0, element: 'anyfunc'})
    }
  });
  console.log("count function result is : " + counter.exports._count());
  console.log(memory.buffer);
}

window.onload = wasmHelloWorld;

window.addEventListener("load", canvasApp, false);

function canvasApp() {
  const displayCanvas = document.getElementById("displayCanvas");
  const context = displayCanvas.getContext("2d");
  context.canvas.width  = window.innerWidth;
  context.canvas.height = window.innerHeight;
  const displayWidth = displayCanvas.width;
  const displayHeight = displayCanvas.height;

  const gridWidth = 120;
  const gridHeight = 72;

  const cellSize = {
    width: displayWidth / gridWidth,
    height: displayHeight / gridHeight
  };
  const options = {
    ease: 0.67,
    velMax: 255,
    minDist: 8,
    minDistSquare: 64,
    sepNormMag: 4
  }

  const list = createCells(cellSize, gridWidth, gridHeight);

  displayCanvas.addEventListener("click", restart(list), false);

  // we aim for 30 fps
  window.setInterval(tick(list, cellSize, context, options), 1000/30);
}