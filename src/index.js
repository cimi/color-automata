/* eslint-disable no-unused-vars */
import vex from './vex';

import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {createCells, restart, tick} from './color-automata';

import WasmLoader from './wasm/wasm-loader';

registerServiceWorker();

// console and debug settings
const noop = () => {};
const originalConsole = {log: console.log, time: console.time, timeEnd: console.timEnd};
const dummyConsole = {log: noop, time: noop, timeEnd: noop};

let currentIntervalId;
let wasm;

const resetCanvas = (canvas, configuration) => {
  const {width, height} = configuration;
  console.log('Resetting canvas to match grid configuration: ', width, height);
  if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
  }
}

const wasmRenderTapestry = (configuration) => {
  console.log('Running the WASM implementation!');
  console.log('Window size: ', window.innerWidth, window.innerHeight);
  const canvas = document.createElement('canvas');

  resetCanvas(canvas, configuration);
  const {width, height} = configuration;
  console.time('initialization');
  const tapestry = new wasm.Tapestry(width, height);
  console.timeEnd('initialization');

  const displayCanvas = document.getElementById('displayCanvas');
  resetCanvas(displayCanvas, {width: window.innerWidth, height: window.innerHeight})

  const context = canvas.getContext('2d');
  const displayContext = displayCanvas.getContext('2d');
  displayContext.scale(scalingFactorX, scalingFactorY);

  currentIntervalId = setInterval(() => {
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
}

const jsRenderTapestry = (configuration) => {
  // extend canvas to full screen
  const displayCanvas = document.getElementById("displayCanvas");
  const context = displayCanvas.getContext("2d");
  context.canvas.width  = window.innerWidth;
  context.canvas.height = window.innerHeight;
  const displayWidth = displayCanvas.width;
  const displayHeight = displayCanvas.height;

  const {width: gridWidth, height: gridHeight} = configuration;
  console.log('Running the pure JS implementation!');
  console.log('Window size: ', displayWidth, displayHeight);
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
  currentIntervalId = window.setInterval(tick(list, cellSize, context, options), 1000/30);
}

const url = new URL(window.location);

const scalingFactorX = Math.max(5, Math.floor(window.innerWidth / 1024));
const scalingFactorY = Math.max(5, Math.floor(window.innerHeight / 1024));

const tapestryConfiguration = {
  width: Math.floor(window.innerWidth / scalingFactorX),
  height: Math.floor(window.innerHeight / scalingFactorY),
  implementation: url.searchParams.get('pureJS') ? 'js' : 'wasm',
  debug: false
}


// TODO: configure cell size instead of choosing width and height
// that way there's no distortion and you can play better with granularity

const openConfigurationModal = () => {
  vex.dialog.buttons.YES.text = 'Reset';
  vex.dialog.open({
    message: `You are looking at a combination between a cellular automaton and a flocking algorithm that yields a color tapestry.
      Use the controls below to reset the tapestry to a different configuration.`,
    input: `<div id="configuration-form">
        <div class="grid-size">
          <span>Grid size</span>
          <input name="height" type="number" value="${tapestryConfiguration.height}"></input>
          <input name="width" type="number" value="${tapestryConfiguration.width}"></input>
        </div>
        <div class="implementation">
          <span>Implementation</span>
          <label><input type="radio" name="implementation" value="js" ${tapestryConfiguration.implementation === 'js' ? 'checked' : ''} />JS</label>
          <label><input type="radio" name="implementation" value="wasm" ${tapestryConfiguration.implementation === 'wasm' ? 'checked' : ''} />WASM</label>
        </div>
        <div class="show-fps">
          <span></span>
          <label for="debug"><input type="checkbox" name="debug" ${tapestryConfiguration.debug ? 'checked' : ''} />Console debugging</label>
        </div>
      <p class="credits"> Inspired by <a href="http://rectangleworld.com/blog/archives/587">Rectangleworld</a>.
      More details on <a href="https://github.com/cimi/color-automata">on GitHub</a>!</p>
      </div>
    `,
    callback: (data) => {
      startTapestry(extractConfiguration(data));
    }
  });
}

const extractConfiguration = (data) => {
  data.width = Number(data.width);
  data.height = Number(data.height);
  console.log(Object.assign(tapestryConfiguration, data));
  return tapestryConfiguration;
}

const startTapestry = (configuration) => {
  clearInterval(currentIntervalId);
  // if debugging is enabled, use the console otherwise don't
  Object.assign(console, configuration.debug ? originalConsole : dummyConsole);

  if (configuration.implementation === 'js') {
    jsRenderTapestry(configuration);
  } else {
    wasmRenderTapestry(configuration);
  }
}

window.onload = () => {
  WasmLoader({wasmBinaryFile: 'tapestry.wasm'}).then(WasmModule => {
    WasmModule.addOnPostRun(() => {
      wasm = WasmModule;
      const octocat = document.getElementsByClassName('github-corner')[0];
      octocat.addEventListener('click', (e) => {
        e.preventDefault();
        openConfigurationModal();
      });
      startTapestry(tapestryConfiguration);
    });
  });
}
