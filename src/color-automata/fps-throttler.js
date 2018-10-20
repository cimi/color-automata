// see https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
export default function FpsThrottler(fps, callback) {
  var delay = 1000 / fps, // calc. time per frame
    time = null, // start time
    frame = -1, // frame count
    tref; // rAF time reference

  function loop(timestamp) {
    if (time === null) time = timestamp; // init start time
    var seg = Math.floor((timestamp - time) / delay); // calc frame no.
    if (seg > frame) {
      // moved to next frame?
      frame = seg; // update
      callback({
        // callback function
        time: timestamp,
        frame: frame
      });
    }
    tref = requestAnimationFrame(loop);
  }
  // play status
  this.isPlaying = false;

  // set frame-rate
  this.frameRate = function(newfps) {
    if (!arguments.length) return fps;
    fps = newfps;
    delay = 1000 / fps;
    frame = -1;
    time = null;
  };

  // enable starting/pausing of the object
  this.start = function() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      tref = requestAnimationFrame(loop);
    }
  };

  this.pause = function() {
    if (this.isPlaying) {
      cancelAnimationFrame(tref);
      this.isPlaying = false;
      time = null;
      frame = -1;
    }
  };
}
