## [See the demo](http://cimi.io/color-automata)

![color-automata](https://github.com/cimi/color-automata/blob/master/public/color-automata.png)

This project was inspired by [A Colorful Cellular Automaton in HTML5 Canvas](http://rectangleworld.com/blog/archives/587). The original JavaScript implementation and the idea behind the algorithm were sourced from that blog post.

The project is also designed to be a proof of concept for efficiency gains when using WebAssembly (hence the alternate 'C++' implementation, see below).

The web assembly implementation allows for a higher resolution and higher frame rate (up to 10x) compared to the original JavaScript implementation. Disclaimer: I did not try to optimise the JS implementation, did not do any profiling etc.

Loading the demo page in your browser will yield a colourful tapestry. This is a form of [generative art](https://en.wikipedia.org/wiki/Generative_art): 

> A typical cellular automaton consists of a grid of cells which continually change their state based upon the current states of their surrounding neighbors. A “state” may refer to a color, which may simply be black or white, as in Conway’s Game of Life. Here I allow the current RGB color of a cell to be affected by the status of the neighboring cells.

> This idea (which may not be original) comes from a confusing insertion of the ideas of a flocking algorithm into a cellular automaton.

## wasm-quickstart 

I've extracted a minimal project setup based on create-react-app and emsdk module objects to make building this sort of stuff simpler:

* https://github.com/cimi/wasm-quickstart

## 'C++'

I haven't written C since University, I've never written C++. [Please forgive the atrocities](http://i0.kym-cdn.com/entries/icons/original/000/008/342/ihave.jpg). Code is reasonably efficient?!

## Resources

* https://github.com/tholman/github-corners/issues/15 - transparent waving Octocat
* https://www.smashingmagazine.com/2017/05/free-geometric-ui-icons-ego/ - favicon source. Great selection of geometric icons, see more [on the author's site](http://www.webalys.com/).
* https://www.smashingmagazine.com/2017/05/abridged-cartoon-introduction-webassembly/ - web assembly cartoons
    - Also check out https://code-cartoons.com/, it’s great!
* https://blog.openbloc.fr/webassembly-first-steps/ - good tutorial to get started with wasm
* https://codelabs.developers.google.com/codelabs/web-assembly-intro/ - a few working projects using wasm

