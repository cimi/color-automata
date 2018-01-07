const resetCanvas = (canvas, configuration) => {
  const { width, height } = configuration;
  console.log("Resetting canvas to match grid configuration: ", width, height);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
};

export const wasmTapestryFactory = WasmModule => {
  let tapestry;
  return configuration => {
    console.log("Running the WASM implementation!");
    console.log("Window size: ", window.innerWidth, window.innerHeight);
    const canvas = document.createElement("canvas");

    resetCanvas(canvas, configuration);
    const { width, height, cellSize } = configuration;

    console.time("initialization");
    if (tapestry) {
      tapestry.reset(width, height);
    } else {
      tapestry = new WasmModule.Tapestry(width, height);
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
    }, 1000 / 30);
  };
};
