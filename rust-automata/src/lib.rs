mod utils;
mod automata;
use crate::automata::State;
use wasm_bindgen::prelude::*;

// cannot generate random numbers:
// WARNING in ../rust-automata/pkg/rust_automata_bg.js 130:14-60
// Critical dependency: the request of a dependency is an expression
// @ ../rust-automata/pkg/rust_automata_bg.wasm
// @ ./index.js
// @ ./bootstrap.js
// use rand::prelude::*;


// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, rust-automata!");
}

// Define the size of our "checkerboard"
const CHECKERBOARD_SIZE: usize = 1000;

/*
 * 1. What is going on here?
 * Create a static mutable byte buffer.
 * We will use for putting the output of our graphics,
 * to pass the output to js.
 * NOTE: global `static mut` means we will have "unsafe" code
 * but for passing memory between js and wasm should be fine.
 *
 * 2. Why is the size CHECKERBOARD_SIZE * CHECKERBOARD_SIZE * 4?
 * We want to have 20 pixels by 20 pixels. And 4 colors per pixel (r,g,b,a)
 * Which, the Canvas API Supports.
 */
const OUTPUT_BUFFER_SIZE: usize = CHECKERBOARD_SIZE * CHECKERBOARD_SIZE * 4;
static mut state: State = State::new();
static mut OUTPUT_BUFFER: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];

// Function to return a pointer to our buffer
// in wasm memory
#[wasm_bindgen]
pub fn get_output_buffer_pointer() -> *const u8 {
    let pointer: *const u8;
    unsafe {
        pointer = OUTPUT_BUFFER.as_ptr();
    }

    return pointer;
}

// Function to generate our checkerboard, pixel by pixel
#[wasm_bindgen]
pub fn generate_checker_board(
    dark_value_red: u8,
    dark_value_green: u8,
    dark_value_blue: u8,
    light_value_red: u8,
    light_value_green: u8,
    light_value_blue: u8
    ) {
    // Since Linear memory is a 1 dimensional array, but we want a grid
    // we will be doing 2d to 1d mapping
    // https://softwareengineering.stackexchange.com/questions/212808/treating-a-1d-data-structure-as-2d-grid
    for y in 0..CHECKERBOARD_SIZE {
        for x in 0..CHECKERBOARD_SIZE {
            // Set our default case to be dark squares
            let mut is_dark_square: bool = true;

            // We should change our default case if
            // We are on an odd y
            if y % 2 == 0 {
                is_dark_square = false;
            }

            // Lastly, alternate on our x value
            if x % 2 == 0 {
                is_dark_square = !is_dark_square;
            }

            // Now that we determined if we are dark or light,
            // Let's set our square value
            let mut square_value_red: u8 = dark_value_red;
            let mut square_value_green: u8 = dark_value_green;
            let mut square_value_blue: u8 = dark_value_blue;
            if !is_dark_square {
                square_value_red = light_value_red;
                square_value_green = light_value_green;
                square_value_blue = light_value_blue;
            }

            // Let's calculate our index, using our 2d -> 1d mapping.
            // And then multiple by 4, for each pixel property (r,g,b,a).
            let square_number: usize = y * CHECKERBOARD_SIZE + x;
            let square_rgba_index: usize = square_number * 4;

            // Finally store the values.
            unsafe {
                let particle = state.particles[square_number];
                OUTPUT_BUFFER[square_rgba_index + 0] = particle.position.x; // Red
                OUTPUT_BUFFER[square_rgba_index + 1] = particle.position.y; // Green
                OUTPUT_BUFFER[square_rgba_index + 2] = particle.position.z; // Blue
                OUTPUT_BUFFER[square_rgba_index + 3] = 255; // Alpha (Always Opaque)
            }
        }
    }
}
