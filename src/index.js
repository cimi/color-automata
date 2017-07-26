import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import TapestryModule from './wasm/tapestry.js';

// import MandelbrotModule from './wasm/mandelbrot.js'


// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const wasmRenderTapestry = () => {
  TapestryModule({wasmBinaryFile: 'wasm/tapestry.wasm'}).then(Tapestry => {
    Tapestry.addOnPostRun(() => {
      const canvas = document.getElementById('displayCanvas');
      const context = canvas.getContext('2d');

      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
      }
      console.time('initialization');
      const tapestry = new Tapestry.Tapestry(width, height);
      console.timeEnd('initialization');

      setInterval(() => {
        console.time('wasm extract image');
        const tile = tapestry.fullImage();
        console.timeEnd('wasm extract image');

        console.time('canvas put image data');
        const imageData = new ImageData(new Uint8ClampedArray(tile), width, height);
        context.putImageData(imageData, 0, 0);
        console.timeEnd('canvas put image data');

        console.time('wasm compute image');
        tapestry.tick();
        console.timeEnd('wasm compute image');

      }, 1000 / 30);
    });
  });
}

window.onload = wasmRenderTapestry;

function canvasApp() {
  const displayCanvas = document.getElementById("displayCanvas");
  const context = displayCanvas.getContext("2d");
  context.canvas.width  = window.innerWidth;
  context.canvas.height = window.innerHeight;
  const displayWidth = displayCanvas.width;
  const displayHeight = displayCanvas.height;

  const gridWidth = 512;
  const gridHeight = 128;

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