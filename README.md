# WebGL Tree Generation

Richard Tang, Nanxi Chen

The goal of this project was to randomly generate terrain and a tree to create a nature scene. 

The project is currently deployed on [github pages](https://rtspw.github.io/WebGL-Tree-Generation/).

## Features

The features currently implemented include:
- terrain generation with parameters
- tree generation with parameters
- simple leaf particle system
- fog shader to create the illusion of a larger world
- working day/night cycle with sun/moon and shifting sky color 

This project relies on the [tiny graphics](https://github.com/encyclopedia-of-code/tiny-graphics-js) library for the control display and abstraction over WebGL's API.

## How to Build

The project is bundled with webpack and output into the docs/ directory. 
To build, run:

```bash
npm install
npx webpack
```

The assets from the docs/ folder can then be served.
