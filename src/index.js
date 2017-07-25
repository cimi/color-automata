import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import Tapestry from './wasm/tapestry2.js';


// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const wasmHelloWorld = () => {
  Tapestry({wasmBinaryFile: 'wasm/tapestry2.wasm'}).then(tapestry => {
    tapestry.addOnPostRun(() => {
      const canvas = document.getElementById('displayCanvas');

      // Canvas resizing from http://stackoverflow.com/a/43364730/2142626
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
      }
      console.log(width, height);
      console.time('mandelbrot');
      const mandelbrot = tapestry.mandelbrot(width, height, 1, -0.5, 0);
      console.timeEnd('mandelbrot');

      console.time('canvas put image data');
      const imageData = new ImageData(new Uint8ClampedArray(mandelbrot), width, height);
      // const context = canvas.getContext('2d');
      // context.putImageData(imageData, 0, 0);
      console.timeEnd('canvas put image data');
    }, err => { throw err; });
  });
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