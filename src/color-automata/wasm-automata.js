const resetCanvas = (canvas, configuration) => {
  const { width, height } = configuration;
  console.log("Resetting canvas to match grid configuration: ", width, height);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
};

const setImage = (WasmModule, image) => {
  const createBuffer = WasmModule.cwrap("create_buffer", "number", [
    "number",
    "number"
  ]);
  const wasmPtr = createBuffer(image.width, image.height);
  WasmModule.HEAP8.set(image.data, wasmPtr);
  return wasmPtr;
};

export const wasmTapestryFactory = WasmModule => {
  let tapestry;
  return configuration => {
    console.log("Running the WASM implementation!");
    console.log("Window size: ", window.innerWidth, window.innerHeight);
    const canvas = document.createElement("canvas");

    resetCanvas(canvas, configuration);
    const {
      img,
      width,
      height,
      cellSize,
      minDist,
      sepNormMag,
      ease
    } = configuration;
    const minDistSquared = minDist * minDist;

    console.time("initialization");
    const imageAddr = setImage(WasmModule, img);
    if (tapestry) {
      tapestry.reset(imageAddr, width, height);
    } else {
      tapestry = new WasmModule.ColorAutomata(
        imageAddr,
        width,
        height,
        minDistSquared,
        sepNormMag,
        ease
      );
    }
    console.timeEnd("initialization");

    const displayCanvas = document.getElementById(configuration.canvasId);
    resetCanvas(displayCanvas, {
      width: window.innerWidth,
      height: window.innerHeight
    });

    const context = canvas.getContext("2d");
    const displayContext = displayCanvas.getContext("2d");
    // reset transform to indentity so scales do not compound
    displayContext.setTransform(1, 0, 0, 1, 0, 0);
    displayContext.scale(cellSize, cellSize);
    console.log(configuration.updatesPerSecond);
    return setInterval(() => {
      console.time("wasm extract image");
      const tile = tapestry.fullImage();
      console.timeEnd("wasm extract image");

      console.time("canvas put image data");
      const imageData = new ImageData(
        new Uint8ClampedArray(tile),
        width,
        height
      );
      context.putImageData(imageData, 0, 0);
      console.timeEnd("canvas put image data");

      console.time("canvas scale other image");
      displayContext.drawImage(canvas, 0, 0);
      console.timeEnd("canvas scale other image");

      console.time("wasm compute image");
      tapestry.tick();
      console.timeEnd("wasm compute image");
    }, configuration.cycleTimeMs);
  };
};
