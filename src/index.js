/* eslint-disable no-unused-vars */
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import WasmLoader from './wasm/tapestry.js';

registerServiceWorker();
const debug = false;
if (!debug) {
  console.time = () => {};
  console.timeEnd = () => {};
}

const wasmRenderTapestry = () => {
  const scalingFactorX = Math.max(5, Math.floor(window.innerWidth / 1024));
  const scalingFactorY = Math.max(5, Math.floor(window.innerHeight / 1024));
  console.log('Running the WASM implementation!');
  console.log('Window size: ', window.innerWidth, window.innerHeight);
  WasmLoader({wasmBinaryFile: 'wasm/tapestry.wasm'}).then(TapestryModule => {
    TapestryModule.addOnPostRun(() => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const width = window.innerWidth / scalingFactorX;
      const height = window.innerHeight / scalingFactorY;
      console.log('Grid size: ', width, height);
      if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
      }
      console.time('initialization');
      const tapestry = new TapestryModule.Tapestry(width, height);
      console.timeEnd('initialization');

      const displayCanvas = document.getElementById('displayCanvas');
      displayCanvas.width = window.innerWidth;
      displayCanvas.height = window.innerHeight;
      const displayContext = displayCanvas.getContext('2d');
      displayContext.scale(scalingFactorX, scalingFactorY);

      setInterval(() => {
        console.time('wasm extract image');
        const tile = tapestry.fullImage();
        console.timeEnd('wasm extract image');

        console.time('canvas put image data');
        const imageData = new ImageData(new Uint8ClampedArray(tile), width, height);
        context.putImageData(imageData, 0, 0);
        console.timeEnd('canvas put image data');

        console.time('canvas scale other image');
        displayContext.drawImage(canvas, 0, 0);
        console.timeEnd('canvas scale other image');

        console.time('wasm compute image');
        tapestry.tick();
        console.timeEnd('wasm compute image');
      }, 1000 / 30);
    });
  });
}

const jsRenderTapestry = () => {
  const displayCanvas = document.getElementById("displayCanvas");
  const context = displayCanvas.getContext("2d");
  context.canvas.width  = window.innerWidth;
  context.canvas.height = window.innerHeight;
  const displayWidth = displayCanvas.width;
  const displayHeight = displayCanvas.height;

  const gridWidth = 512;
  const gridHeight = 288;
  console.log('Running the pure JS implementation!');
  console.log('Window size: ', window.innerWidth, window.innerHeight);
  console.log('Grid size: ', gridWidth, gridHeight);

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

const url = new URL(window.location);
console.log(url);
if (url.searchParams.get('pureJS')) {
  window.onload = jsRenderTapestry;
} else {
  window.onload = wasmRenderTapestry;
}
