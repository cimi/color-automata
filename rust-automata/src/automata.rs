// we need four buffers: color, velocity primary and secondary
// it would be great if we can switch pointers between them and avoid copying
// next state = f(current state)

// types: pixel
// keep pointers to all neighbours? we need to average over all of them
use cgmath::Vector3;
use std::vec::Vec;

// trying to initialise an array fails with stackoverflow
// stack is ~2 MB
const RES_4K: usize = 3840 * 2160;
// const RES_4K: usize = 10;

#[derive(Copy, Clone)]
pub struct Particle {
  pub position: Vector3<u8>,
  pub velocity: Vector3<u8>
}

impl Default for Particle {
  #[inline]
  fn default() -> Particle {
    Particle {
      position: Vector3::new(0, 0, 0),
      velocity: Vector3::new(255, 255, 255)
    }
  }
}

impl Particle {
  pub fn new() -> Particle {
    Particle {
      position: Vector3::new(0, 0, 0),
      velocity: Vector3::new(255, 255, 255)
    }
  }

  pub fn update(&mut self) {
    self.position.x = self.position.x + 1;
  }
}

// type State = Vec<Particle>;

pub struct State {
  pub particles: Vec<Particle>
}

impl State {
  pub fn new() -> State {
    State {
      particles: vec![Particle::default(); RES_4K]
    }
  }

  pub fn next(&mut self) {
    for i in 0..RES_4K {
      self.particles[i].update();
    }
  }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
      // let mut state = Vec::with_capacity(RES_4K);
      // (0..RES_4K).for_each(|_| state.push(Particle::default()));
      // let mut state = vec![Particle::default(); RES_4K];
      let mut state = State::new();
      assert_eq!(state.particles.len(), RES_4K);
      assert_eq!(state.particles[0].position.x, 0);
      state.next();
      assert_eq!(state.particles[0].position.x, 1);
      assert_eq!(state.particles[1].position.x, 1);
      assert_eq!(4, 2 + 2);
    }
}
