import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import Tapestry from './wasm/tapestry.js';


// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const wasmHelloWorld = () => {
  const tapestry = Tapestry({wasmBinaryFile: 'wasm/tapestry.wasm'});
  console.dir(tapestry)
  // the module loading is async!
  // tapestry.asm._init(40, 40);
  // tapestry.onRuntimeInitialized = () => {
  //   console.dir(tapestry.asm);
  //   console.log(tapestry.asm._init);
  // }
  tapestry.then(() => {
    const allocAddr = tapestry.asm._init(40, 40);
    for (let i = 0; i < 160; i++) {
      console.log(tapestry.HEAP8[allocAddr + i]);
    }
  });
  // setTimeout(() => {
  //   console.dir(tapestry.asm);
  //   console.log(tapestry.asm._init);
  // }, 100);
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