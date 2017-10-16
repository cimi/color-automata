Thank you:

* http://rectangleworld.com/blog/archives/587 - the original JS implementation and inspiration for this project

Web assembly resources:

* https://www.smashingmagazine.com/2017/05/abridged-cartoon-introduction-webassembly/ - web assembly cartoons
    - Also check out https://code-cartoons.com/, it’s great!
* https://blog.openbloc.fr/webassembly-first-steps/ - good tutorial to get started with wasm
* https://codelabs.developers.google.com/codelabs/web-assembly-intro/ - a few working projects using wasm

Notes:

* technically if wasm isn't available it could fall back to asm.js, but it's out of scope for this demo

## Building

Can't run the make as an npm script because emsdk comes with node v4.1.1 which breaks yarn. The build needs to be done in two steps. To build the wasm binary module and the loader run:

```
cd wasm && make clean && make all
```

Then, to build the production bundle for the webapp:

```
yarn build
```
