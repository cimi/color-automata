import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import TapestryModule from './wasm/tapestry.js';

// import MandelbrotModule from './wasm/mandelbrot.js'


// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const wasmHelloWorld = () => {
  TapestryModule({wasmBinaryFile: 'wasm/tapestry.wasm'}).then(Tapestry => {
    Tapestry.addOnPostRun(() => {
      const canvas = document.getElementById('displayCanvas');
      const context = canvas.getContext('2d');

      // Canvas resizing from http://stackoverflow.com/a/43364730/2142626
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
      }
      console.log(width, height);
      console.time('initialization');
      const tapestry = new Tapestry.Tapestry(width, height);
      console.timeEnd('initialization');

      function drawTile() {
        console.time('compute tile');
        const tile = tapestry.nextTile();
        console.timeEnd('compute tile');
        if (tile) {
          // console.time('import image data');
          const imageData = new ImageData(new Uint8ClampedArray(tile.data), tile.width, tile.height);
          // console.timeEnd('import image data');
          // console.time('put image data');
          context.putImageData(imageData, tile.x, tile.y);
          // console.timeEnd('put image data');
          window.requestAnimationFrame(drawTile);
        }
      }
      window.requestAnimationFrame(drawTile);


      // console.time('canvas create image data');
      // const imageData = new ImageData(new Uint8ClampedArray(mandelbrot), width, height);
      // console.timeEnd('canvas put image data');
      // console.time('canvas put image data');
      // const context = canvas.getContext('2d');
      // context.putImageData(imageData, 0, 0);
      // console.timeEnd('canvas put image data');
    }, err => { throw err; });
  });
}

window.onload = wasmHelloWorld;


// const mandelbrotTiling = () => {
//   Mandelbrot({wasmBinaryFile: 'wasm/mandelbrot.wasm'}).then(Mandelbrot => {
//     Mandelbrot.addOnPostRun(() => {
//       const canvas = document.getElementById('displayCanvas');
//       const context = canvas.getContext('2d');

//       // Canvas resizing from http://stackoverflow.com/a/43364730/2142626
//       const width = window.innerWidth;
//       const height = window.innerHeight;
//       if (canvas.width !== width || canvas.height !== height) {
//           canvas.width = width;
//           canvas.height = height;
//       }

//       const mandelbrot = new Mandelbrot.Mandelbrot(width, height, 1, -0.5, 0);

//       function drawTile() {
//         const tile = mandelbrot.nextTile();
//         if (tile) {
//             console.time('image data');
//             const imageData = new ImageData(new Uint8ClampedArray(tile.data), tile.width, tile.height);
//             console.timeEnd('image data');
//             context.putImageData(imageData, tile.x, tile.y);
//             window.requestAnimationFrame(drawTile);
//         }
//       }
//       window.requestAnimationFrame(drawTile);
//     });
//   });
// }

// window.onload = mandelbrotTiling;

// window.addEventListener("load", canvasApp, false);

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