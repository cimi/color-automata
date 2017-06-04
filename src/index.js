// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();


window.addEventListener("load", windowLoadHandler, false);

function windowLoadHandler() {
  canvasApp();
}


function canvasApp() {

  var displayCanvas = document.getElementById("displayCanvas");
  var context = displayCanvas.getContext("2d");
  context.canvas.width  = window.innerWidth;
  context.canvas.height = window.innerHeight;
  var displayWidth = displayCanvas.width;
  var displayHeight = displayCanvas.height;

  var cellList;
  var gridWidth;
  var gridHeight;
  var cellHeight;
  var cellWidth;
  var timer;

  ///////////////////////
  //for speed, defining variables used in update function as global variables.
  var i;
  var cell;
  var rAve, gAve, bAve;
  var rVelAve, gVelAve, bVelAve;
  var ease;
  var rv,gv,bv,mag;
  var rAccel, gAccel, bAccel;
  var rSep, gSep, bSep;
  var velMax;
  var minDist;
  var minDistSquare;
  var dr, dg, db;
  var neighbor;
  var neighborPointer;
  var f;
  var sepMagRecip;
  var sepNormMag;

  ///////////////////////

  init();

  function init() {
    gridWidth = 120;
    gridHeight = 72;

    cellWidth = displayWidth/gridWidth;
    cellHeight = displayHeight/gridHeight;

    ease = 0.67;
    velMax = 255;
    minDist = 8;
    minDistSquare = minDist*minDist;
    sepNormMag = 4;

    createCells();

    displayCanvas.addEventListener("click", restart, false);

    timer = window.setInterval(onTimer, 1000/30);
  }

  function createCells() {
    var i,j;
    var r,g,b;
    var cellArray = [];
    cellList = {};
    for (i = 0; i < gridWidth; i++) {
      cellArray.push([]);
      for (j = 0; j < gridHeight; j++) {
        r = Math.random()*255;
        g = Math.random()*255;
        b = Math.random()*255;
        var newCell = {
          x: i*displayWidth/gridWidth,
          y: j*displayHeight/gridHeight,
          r: r,
          g: g,
          b: b,
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
        }

        //set neighbors
        if (i > 0) {
          newCell.neighbors.push(cellArray[i-1][j]);
          cellArray[i-1][j].neighbors.push(newCell);
        }
        if (j > 0) {
          newCell.neighbors.push(cellArray[i][j-1]);
          cellArray[i][j-1].neighbors.push(newCell);
        }

        //store cells in a 2D array only for the sake of setting neighbors
        cellArray[i].push(newCell);

        //store cells in a more efficient linked list, for use in update loop
        if ((i == 0) && (j == 0)) {
          cellList.first = newCell;
        }
        else {
          newCell.next = cellList.first;
          cellList.first = newCell;
        }
      }
    }

    //convert neighbor arrays to linked lists - linked list just has pointer objects.
    var cell = cellList.first;
    var numNeighbors;
    while (cell != null) {
      numNeighbors = 1;
      cell.neighborPointerList.first = {};
      cell.neighborPointerList.first.neighbor = cell.neighbors[0];
      for (i = 1; i < cell.neighbors.length; i++) {
        var newPointer = {};
        newPointer.next = cell.neighborPointerList.first;
        cell.neighborPointerList.first = newPointer;
        newPointer.neighbor = cell.neighbors[i];
        ++numNeighbors;
      }
      cell.numNeighbors = numNeighbors;
      cell = cell.next;
    }
  }

  function restart(evt) {
    cell = cellList.first;
    while (cell != null) {
      cell.bufferR = cell.r = Math.random()*255;
      cell.bufferG = cell.g = Math.random()*255;
      cell.bufferB = cell.b = Math.random()*255;
      cell.bufferRVel = cell.rVel = 0;
      cell.bufferGVel = cell.gVel = 0;
      cell.bufferBVel = cell.bVel = 0;
      cell = cell.next;
    }
  }

  function onTimer(evt) {
    cell = cellList.first;
    while (cell != null) {
      rAve = 0;
      gAve = 0;
      bAve = 0;
      rVelAve = 0;
      gVelAve = 0;
      bVelAve = 0;
      rSep = 0;
      gSep = 0;
      bSep = 0;
      neighborPointer = cell.neighborPointerList.first;
      while (neighborPointer != null) {
        neighbor = neighborPointer.neighbor;
        rAve += neighbor.r;
        gAve += neighbor.g;
        bAve += neighbor.b;
        rVelAve += neighbor.rVel;
        gVelAve += neighbor.gVel;
        bVelAve += neighbor.bVel;
        dr = cell.r - neighbor.r;
        dg = cell.g - neighbor.g;
        db = cell.b - neighbor.b;
        if (dr*dr + dg*dg + db*db < minDistSquare) {
          rSep += dr;
          gSep += dg;
          bSep += db;
        }
        neighborPointer = neighborPointer.next;
      }

      rAve *= (f = 1/cell.numNeighbors);
      gAve *= f;
      bAve *= f;
      rVelAve *= f;
      gVelAve *= f;
      bVelAve *= f;

      //normalize separation vector
      if ((rSep != 0) || (gSep != 0) || (bSep != 0)) {
        rSep *= (sepMagRecip = sepNormMag/Math.sqrt(rSep*rSep + gSep*gSep + bSep*bSep));
        gSep *= sepMagRecip;
        bSep *= sepMagRecip;
      }

      //Update velocity by combining separation, alignment and cohesion effects. Change velocity only by 'ease' ratio.
      cell.bufferRVel += ease*(rSep + rVelAve + rAve - cell.r - cell.bufferRVel);
      cell.bufferGVel += ease*(gSep + gVelAve + gAve - cell.g - cell.bufferGVel);
      cell.bufferBVel += ease*(bSep + bVelAve + bAve - cell.b - cell.bufferBVel);


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

      //bounce colors off of color cube boundaries
      if (cell.bufferR < 0) {
        cell.bufferR = 0;
        cell.bufferRVel *= -1;
      }
      else if (cell.bufferR > 255) {
        cell.bufferR = 255;
        cell.bufferRVel *= -1;
      }
      if (cell.bufferG < 0) {
        cell.bufferG = 0;
        cell.bufferGVel *= -1;
      }
      else if (cell.bufferG > 255) {
        cell.bufferG = 255;
        cell.bufferGVel *= -1;
      }
      if (cell.bufferB < 0) {
        cell.bufferB = 0;
        cell.bufferBVel *= -1;
      }
      else if (cell.bufferB > 255) {
        cell.bufferB = 255;
        cell.bufferBVel *= -1;
      }

      cell = cell.next;
    }

    //now loop through again, copy buffer values and draw
    cell = cellList.first;
    while (cell != null) {
      cell.r = cell.bufferR;
      cell.g = cell.bufferG;
      cell.b = cell.bufferB;
      cell.rVel = cell.bufferRVel;
      cell.gVel = cell.bufferGVel;
      cell.bVel = cell.bufferBVel;
      context.fillStyle = "rgb(" + ~~cell.r + "," + ~~cell.g + "," + ~~cell.b +")";
      context.fillRect(cell.x, cell.y, cellWidth, cellHeight);

      cell = cell.next;
    }
  }
}