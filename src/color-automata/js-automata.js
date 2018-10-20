import FpsThrottler from "./fps-throttler";

const randomColor = () => ({
  r: Math.random() * 255,
  g: Math.random() * 255,
  b: Math.random() * 255
});

const setNeighbours = (cell, grid) => {
  const { i, j } = cell;
  if (i > 0) {
    cell.neighbors.push(grid[i - 1][j]);
    grid[i - 1][j].neighbors.push(cell);
  }
  if (j > 0) {
    cell.neighbors.push(grid[i][j - 1]);
    grid[i][j - 1].neighbors.push(cell);
  }
};

const cellFactory = ({ width, height }) => (i, j) => {
  const { r, g, b } = randomColor();
  return {
    i,
    j,
    r,
    g,
    b,
    x: i * width,
    y: j * height,
    bufferR: r,
    bufferG: g,
    bufferB: b,
    rVel: 0,
    gVel: 0,
    bVel: 0,
    bufferRVel: 0,
    bufferGVel: 0,
    bufferBVel: 0,
    neighbors: [],
    neighborPointerList: {}
  };
};

const addToList = (cell, list) => {
  const { i, j } = cell;
  if (i === 0 && j === 0) {
    list.first = cell;
  } else {
    cell.next = list.first;
    list.first = cell;
  }
};

const arrangeNeighbors = list => {
  // TODO: this doesn't make much sense
  let cell = list.first;
  while (cell != null) {
    let numNeighbors = 1;
    cell.neighborPointerList.first = { neighbor: cell.neighbors[0] };
    for (let i = 1; i < cell.neighbors.length; i++) {
      const newPointer = { next: cell.neighborPointerList.first };
      cell.neighborPointerList.first = newPointer;
      newPointer.neighbor = cell.neighbors[i];
      ++numNeighbors;
    }
    cell.numNeighbors = numNeighbors;
    cell = cell.next;
  }
};

const createCells = (cellSize, horizontalCells, verticalCells) => {
  const grid = [];
  const list = {};
  const makeCell = cellFactory(cellSize);
  for (let i = 0; i < horizontalCells; i++) {
    grid.push([]);
    for (let j = 0; j < verticalCells; j++) {
      const newCell = makeCell(i, j);
      setNeighbours(newCell, grid);
      //store cells in a 2D array only for the sake of setting neighbors
      grid[i].push(newCell);
      addToList(newCell, list);
    }
  }
  arrangeNeighbors(list);
  return list;
};

const restart = list => () => {
  let cell = list.first;
  while (cell) {
    const { r, g, b } = randomColor();
    cell.bufferR = cell.r = r;
    cell.bufferG = cell.g = g;
    cell.bufferB = cell.b = b;
    cell.bufferRVel = cell.rVel = 0;
    cell.bufferGVel = cell.gVel = 0;
    cell.bufferBVel = cell.bVel = 0;
    cell = cell.next;
  }
};

const fixBoundaries = cell => {
  //bounce colors off of color cube boundaries
  if (cell.bufferR < 0) {
    cell.bufferR = 0;
    cell.bufferRVel *= -1;
  } else if (cell.bufferR > 255) {
    cell.bufferR = 255;
    cell.bufferRVel *= -1;
  }

  if (cell.bufferG < 0) {
    cell.bufferG = 0;
    cell.bufferGVel *= -1;
  } else if (cell.bufferG > 255) {
    cell.bufferG = 255;
    cell.bufferGVel *= -1;
  }
  if (cell.bufferB < 0) {
    cell.bufferB = 0;
    cell.bufferBVel *= -1;
  } else if (cell.bufferB > 255) {
    cell.bufferB = 255;
    cell.bufferBVel *= -1;
  }
};

const tick = (list, cellSize, context, options) => () => {
  let cell = list.first;
  const { ease, minDistSquare, sepNormMag } = options;
  while (cell != null) {
    let [rAve, gAve, bAve, rVelAve, gVelAve, bVelAve, rSep, gSep, bSep] = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
    let neighborPointer = cell.neighborPointerList.first;
    while (neighborPointer != null) {
      const neighbor = neighborPointer.neighbor;
      rAve += neighbor.r;
      gAve += neighbor.g;
      bAve += neighbor.b;
      rVelAve += neighbor.rVel;
      gVelAve += neighbor.gVel;
      bVelAve += neighbor.bVel;
      const dr = cell.r - neighbor.r;
      const dg = cell.g - neighbor.g;
      const db = cell.b - neighbor.b;
      if (dr * dr + dg * dg + db * db < minDistSquare) {
        rSep += dr;
        gSep += dg;
        bSep += db;
      }
      neighborPointer = neighborPointer.next;
    }

    const f = 1 / cell.numNeighbors;
    rAve *= f;
    gAve *= f;
    bAve *= f;
    rVelAve *= f;
    gVelAve *= f;
    bVelAve *= f;

    //normalize separation vector
    if (rSep !== 0 || gSep !== 0 || bSep !== 0) {
      const length = Math.sqrt(rSep * rSep + gSep * gSep + bSep * bSep);
      const sepMagRecip = sepNormMag / length;
      rSep *= sepMagRecip;
      gSep *= sepMagRecip;
      bSep *= sepMagRecip;
    }

    //Update velocity by combining separation, alignment and cohesion effects. Change velocity only by 'ease' ratio.
    cell.bufferRVel +=
      ease * (rSep + rVelAve + rAve - cell.r - cell.bufferRVel);
    cell.bufferGVel +=
      ease * (gSep + gVelAve + gAve - cell.g - cell.bufferGVel);
    cell.bufferBVel +=
      ease * (bSep + bVelAve + bAve - cell.b - cell.bufferBVel);

    //Code for clamping velocity commented out because in my testing, the velocity never went over the max. (But you may wish to restore this
    //code if you experiment with different parameters.)
    /*
    if ((mag = Math.sqrt(cell.bufferRVel*cell.bufferRVel + cell.bufferGVel*cell.bufferGVel + cell.bufferBVel*cell.bufferBVel))> velMax) {
      cell.bufferRVel *= (f = velMax/mag);
      cell.bufferGVel *= f;
      cell.bufferBVel *= f;
      Debugger.log("clamped");
    }
    */

    //update colors according to color velocities
    cell.bufferR += cell.bufferRVel;
    cell.bufferG += cell.bufferGVel;
    cell.bufferB += cell.bufferBVel;

    fixBoundaries(cell);

    cell = cell.next;
  }

  //now loop through again, copy buffer values and draw
  cell = list.first;
  while (cell != null) {
    cell.r = cell.bufferR;
    cell.g = cell.bufferG;
    cell.b = cell.bufferB;
    cell.rVel = cell.bufferRVel;
    cell.gVel = cell.bufferGVel;
    cell.bVel = cell.bufferBVel;
    context.fillStyle = `rgb(${~~cell.r},${~~cell.g},${~~cell.b})`;
    context.fillRect(cell.x, cell.y, cellSize.width, cellSize.height);

    cell = cell.next;
  }
};

export const jsTapestry = configuration => {
  // extend canvas to full screen
  const { canvasId } = configuration;

  const displayCanvas = document.getElementById(canvasId);
  const context = displayCanvas.getContext("2d");

  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

  context.canvas.width = windowWidth;
  context.canvas.height = windowHeight;

  displayCanvas.width = windowWidth;
  displayCanvas.height = windowHeight;

  const { width: gridWidth, height: gridHeight } = configuration;
  const { width: displayWidth, height: displayHeight } = displayCanvas;

  console.log("Running the pure JS implementation!");
  console.log("Window size: ", displayWidth, displayHeight);
  console.log("Grid size: ", gridWidth, gridHeight);

  const cellSize = {
    width: displayWidth / gridWidth,
    height: displayHeight / gridHeight
  };

  const options = {
    ease: configuration.ease,
    velMax: 255,
    minDist: configuration.minDist,
    minDistSquare: configuration.minDist * configuration.minDist,
    sepNormMag: configuration.sepNormMag
  };

  const list = createCells(cellSize, gridWidth, gridHeight);

  displayCanvas.addEventListener("click", restart(list), false);
  const animate = tick(list, cellSize, context, options);
  return new FpsThrottler(configuration.fps, animate);
};
