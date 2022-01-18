import * as wasm from "rust-automata/rust_automata_bg.wasm";
import { interpolateMagma } from "d3-scale-chromatic";
import { color as d3Color } from "d3-color";
import Stats from "stats.js";

// wasm.greet();
const stats = new Stats();
document.body.appendChild(stats.dom);

// Create a Uint8Array to give us access to Wasm Memory
const wasmByteMemoryArray = new Uint8Array(wasm.memory.buffer);

// Get our canvas element from our index.html
const canvasElement = document.querySelector("canvas");

// Set up Context and ImageData on the canvas
const canvasContext = canvasElement.getContext("2d");
const canvasWidth = 1024;
const canvasHeight = 1024;
const canvasImageData = canvasContext.createImageData(
  canvasWidth,
  canvasHeight
);
canvasElement.width = canvasWidth;
canvasElement.height = canvasHeight;
// Clear the canvas
canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
let currentRow = 1;
const drawCheckerBoard = () => {
  const gridSize = canvasWidth * canvasHeight;
  const color = d3Color(
    interpolateMagma((Math.sin(Date.now() / 10e3) + 1) / 2)
  );
  // Generate a new checkboard in wasm
  wasm.generate_image(color.r, color.g, color.b, (currentRow % gridSize) + 1);

  // Pull out the RGBA values from Wasm memory
  // Starting at the memory index of out output buffer (given by our pointer)
  // 20 * 20 * 4 = checkboard max X * checkerboard max Y * number of pixel properties (R,G.B,A)
  const outputPointer = wasm.get_output_buffer_pointer();
  const imageDataArray = wasmByteMemoryArray.slice(
    outputPointer,
    outputPointer + gridSize * 4
  );
  // Set the values to the canvas image data

  canvasImageData.data.set(imageDataArray);

  // Clear the canvas
  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Place the new generated checkerboard onto the canvas
  canvasContext.putImageData(canvasImageData, 0, 0);
  stats.update();
  window.requestAnimationFrame(drawCheckerBoard);
  currentRow += 3;
};

requestAnimationFrame(drawCheckerBoard);
