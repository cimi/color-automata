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
const GRID_SIZE_X: usize = 1024;
const GRID_SIZE_Y: usize = 1024;
const GRID_SIZE: usize = GRID_SIZE_X * GRID_SIZE_Y;
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
const OUTPUT_BUFFER_SIZE: usize = GRID_SIZE * 4;

static mut OUTPUT_BUFFER: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];
static mut VELOCITY_BUFFER: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];
static mut SECONDARY: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];
static mut VELOCITY_SECONDARY: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];

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

fn get_idx(x: usize, y: usize) -> usize {
    return (y * GRID_SIZE_X + x) * 4;
}

fn get_val(x: i32, y: i32) -> bool {
    if (x < 0 || y < 0 || x >= GRID_SIZE_X as i32 || y >= GRID_SIZE_Y as i32) {
        return true;
    }
    unsafe {
        return OUTPUT_BUFFER[get_idx(x as usize, y as usize)] != 255;
    }
}

fn compute(x: i32, y: i32) -> bool {
    let p1 = get_val(x - 1, y - 1);
    let p2 = get_val(x, y - 1);
    let p3 = get_val(x + 1, y - 1);
    if ((p1 && !p2 && !p3) || (p1 == p2 && p2 == p3)) {
        return false;
    } else {
        return true;
    }
}

fn set_on(x: usize, y: usize, r: u8, g: u8, b: u8) {
    let idx = get_idx(x, y);
    let col = ((x + y) % 255) as u8;
    unsafe {
        OUTPUT_BUFFER[idx + 0] = r + col;
        OUTPUT_BUFFER[idx + 1] = g + col;
        OUTPUT_BUFFER[idx + 2] = b + col;
        OUTPUT_BUFFER[idx + 3] = 255;
    }
}

fn set_off(x: usize, y: usize) {
    let idx = get_idx(x, y);
    unsafe {
        OUTPUT_BUFFER[idx + 0] = 255;
        OUTPUT_BUFFER[idx + 1] = 255;
        OUTPUT_BUFFER[idx + 2] = 255;
        OUTPUT_BUFFER[idx + 3] = 128;
    }
}

// Function to generate our checkerboard, pixel by pixel
#[wasm_bindgen]
pub fn generate_checker_board(
    r: u8,
    g: u8,
    b: u8,
    stop: usize
    ) {
    for y in 0..GRID_SIZE_Y {
        if y > stop {
            break;
        }
        for x in 0..GRID_SIZE_X {
            let square_number: usize = y * GRID_SIZE_X + x;
            let square_rgba_index: usize = square_number * 4;
            // 00010011011111
            if y == 0 {
                // if compute(x as i32, (CHECKERBOARD_SIZE - 1) as i32) {
                //     set_on(x, y);
                // } else {
                //     set_off(x, y);
                // }
                set_off(x, y);
            } else {
                if compute(x as i32, y as i32) {
                    set_on(x, y, r, g, b);
                } else {
                    set_off(x, y);
                }
            }
        }
    }
}
