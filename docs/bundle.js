/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./generate-tree.js":
/*!**************************!*\
  !*** ./generate-tree.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tiny-graphics.js */ "./tiny-graphics.js");
//const tiny = require('./tiny-graphics-copy.js');


const {
  vec3, Mat4,
} = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

function Branch(rootPosition, directionVector, height, radius) {
  this.rootPosition = rootPosition;
  this.directionVector = directionVector;
  this.height = height;
  this.radius = radius; 
}

function uniformRV(start, end) {
  return start + Math.random() * (end - start);
}

function getRandomOrthogonalVector(inputVector) {
  const randomVector = vec3(Math.random(), Math.random(), Math.random());
  return inputVector.cross(randomVector).normalized();
}

/**
 * @param {Object} parameters
 *    initialDirectionVector: Direction it initially builds off. Starts from origin for starting position
 *    baseLength: Upper bound for length of trunk
 *    baseRadius: Upper boud for radius of trunk
 *    branchLengthLowerBoundFactor: What fraction of the upper bound the lower bound should be
 *    cutoffThreshold: Stop recursively creating branches when length has decayed to certain number
 *    leafThreshold: Below what size should there start being leaves
 *    lengthDecayRate: Determines the length of the chilren branches for each recursive call
 *    radiusDecayRate: Determines fraction of radius each recursive call should use
 *    minSplitAngle: Upper bound for angle from direction vector new branches should split
 *    maxSplitAngle: Lower bound for angle from direction vector new branches should split
 */
class TreeGenerator {
  constructor(parameters = {}) {
    const {
      initialDirectionVector = vec3(0, 1, 0),
      baseLength = 6,
      baseRadius = 1,
      cutoffThreshold = 1,
      leafThreshold = 3,
      lengthDecayRate = 0.9,
      radiusDecayRate = 0.5,
      minSplitAngle = Math.PI / 6,
      maxSplitAngle = Math.PI / 3,
      branchLengthLowerBoundFactor = 0.75,
      extraTrunkLength = 4,
    } = parameters;
    Object.assign(this, {
      initialDirectionVector,
      baseLength,
      baseRadius,
      cutoffThreshold,
      leafThreshold,
      lengthDecayRate,
      radiusDecayRate,
      minSplitAngle,
      maxSplitAngle,
      branchLengthLowerBoundFactor,
      extraTrunkLength,
    });
  }

  updateParameters(parameters = {}) {
    Object.assign(this, parameters);
  }

  generateTree() {
    this.branches = [];
    this.leafPositions = [];
    const rootPosition = vec3(0, 0, 0);
    const trunkLength = uniformRV(this.baseLength * this.branchLengthLowerBoundFactor, this.baseLength);
    const trunk = new Branch(rootPosition, this.initialDirectionVector, trunkLength + this.extraTrunkLength, this.baseRadius);
    this.branches.push(trunk);
    const endPoint = rootPosition.plus(this.initialDirectionVector.times(trunkLength + this.extraTrunkLength));
    this.__createBranches(endPoint, this.initialDirectionVector, trunkLength * this.lengthDecayRate, this.baseRadius * this.radiusDecayRate)
    return {
      branches: this.branches,
      leaves: this.leafPositions,
    };
  }

  /**
   * Creates two new branches and adds to branches array. Runs recursively with smaller length parameters
   * until cutoff threshold for the length is reached.
   * @param {vec3} startPos - Position to place branch at
   * @param {vec3} directionVector - Direction of the branch from the start position
   * @param {Number} branchLength - Upper bound on length of the branches
   * @param {Number} branchRadius - Upper bound on the radius of the branches
   */
  __createBranches(startPos, directionVector, branchLength, branchRadius) {
    if (branchLength < this.cutoffThreshold) {
      this.leafPositions.push(startPos);
      return;
    }
    if (branchLength < this.leafThreshold) {
      this.leafPositions.push(startPos);
    }
    const normalAxis = getRandomOrthogonalVector(directionVector).times(Math.random());
    const branchVector1 = Mat4.rotation(uniformRV(this.minSplitAngle, this.maxSplitAngle), ...normalAxis).times(directionVector).to3().normalized();
    const branchVector2 = Mat4.rotation(uniformRV(-this.maxSplitAngle, -this.minSplitAngle), ...normalAxis).times(directionVector).to3().normalized();
    const length1 = uniformRV(branchLength * this.branchLengthLowerBoundFactor, branchLength);
    const length2 = uniformRV(branchLength * this.branchLengthLowerBoundFactor, branchLength);
    this.branches.push(new Branch(startPos, branchVector1, length1, branchRadius))
    this.branches.push(new Branch(startPos, branchVector2, length2, branchRadius))
    const endPoint1 = startPos.plus(branchVector1.times(length1));
    const endPoint2 = startPos.plus(branchVector2.times(length2));
    this.__createBranches(endPoint1, branchVector1, length1 * this.lengthDecayRate, branchRadius * this.radiusDecayRate);
    this.__createBranches(endPoint2, branchVector2, length2 * this.lengthDecayRate, branchRadius * this.radiusDecayRate);
  }
}

/* harmony default export */ __webpack_exports__["default"] = (TreeGenerator);


/***/ }),

/***/ "./index.css":
/*!*******************!*\
  !*** ./index.css ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !./node_modules/css-loader/dist/cjs.js!./index.css */ "./node_modules/css-loader/dist/cjs.js!./index.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);

var exported = content.locals ? content.locals : {};



module.exports = exported;

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tiny-graphics.js */ "./tiny-graphics.js");
/* harmony import */ var _tiny_graphics_widgets_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tiny-graphics-widgets.js */ "./tiny-graphics-widgets.js");
/* harmony import */ var _main_scene_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./main-scene.js */ "./main-scene.js");
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./index.css */ "./index.css");
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_index_css__WEBPACK_IMPORTED_MODULE_3__);








const rootDiv = document.getElementById('main-canvas');
const scenes = [new _main_scene_js__WEBPACK_IMPORTED_MODULE_2__["default"]()];

new _tiny_graphics_widgets_js__WEBPACK_IMPORTED_MODULE_1__["widgets"].Canvas_Widget(rootDiv, scenes);

/***/ }),

/***/ "./main-scene.js":
/*!***********************!*\
  !*** ./main-scene.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tiny-graphics.js */ "./tiny-graphics.js");
/* harmony import */ var _scene_components_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scene-components.js */ "./scene-components.js");
/* harmony import */ var _shaders_phong_shader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/phong-shader.js */ "./shaders/phong-shader.js");
/* harmony import */ var _shaders_phong_with_fog_shader_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/phong-with-fog-shader.js */ "./shaders/phong-with-fog-shader.js");
/* harmony import */ var _shapes_leaf_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shapes/leaf.js */ "./shapes/leaf.js");
/* harmony import */ var _shapes_offset_square_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shapes/offset-square.js */ "./shapes/offset-square.js");
/* harmony import */ var _shapes_subdivision_sphere_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./shapes/subdivision-sphere.js */ "./shapes/subdivision-sphere.js");
/* harmony import */ var _shapes_cube_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./shapes/cube.js */ "./shapes/cube.js");
/* harmony import */ var _shapes_tree_bark_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./shapes/tree-bark.js */ "./shapes/tree-bark.js");
/* harmony import */ var _generate_tree_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./generate-tree.js */ "./generate-tree.js");














const {
  Scene,
  vec3,
  Mat4,
  Material,
  color,
  Light,
  vec4,
} = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

function lerp(x, y, factor) {
  return x + (y - x) * factor;
}

function lerpRGB(colorA, colorB, factor = 0.5) {
  return [
    lerp(colorA[0], colorB[0], factor),
    lerp(colorA[1], colorB[1], factor),
    lerp(colorA[2], colorB[2], factor),
    lerp(colorA[3], colorB[3], factor),
  ];
}

function clamp(value, max = 1, min = -1) {
  return Math.max(min, Math.min(max, value));
}

// 1   - ?        240,248,255
// .5  - #f8b195  248,177,149
// .4  - #f67280  246,114,128
// .3  - #c06c84  192,108,132
// .1  - #6c5b7b   108,91,123
// -.2 - #355c7d    53,92,125
// -1  - ?           25,25,50
function getColorFromSpectrum(value) {
  const clampedValue = clamp(value);
  if (.4 <= clampedValue && clampedValue <= 1) {
    const normalizedValue = (clampedValue - 0.4) / 0.6;
    return lerpRGB([248/255, 177/255, 149/255, 1], [240/255, 248/255, 255/255, 1], normalizedValue);
  } else if (.2 <= clampedValue && clampedValue < .4) {
    const normalizedValue = (clampedValue - 0.2) / 0.2;
    return lerpRGB([246/255, 114/255, 128/255, 1], [248/255, 177/255, 149/255, 1], normalizedValue);
  } else if (.1 <= clampedValue && clampedValue < .2) {
    const normalizedValue = (clampedValue - 0.1) / 0.1;
    return lerpRGB([192/255, 108/255, 132/255, 1], [246/255, 114/255, 128/255, 1], normalizedValue);
  } else if (-.1 <= clampedValue && clampedValue < .1) {
    const normalizedValue = (clampedValue + 0.1) / 0.2;
    return lerpRGB([108/255, 91/255, 123/255, 1], [192/255, 108/255, 132/255, 1], normalizedValue);
  } else if (-.2 <= clampedValue && clampedValue < -.1) {
    const normalizedValue = (clampedValue + .2) / 0.1;
    return lerpRGB([53/255, 92/255, 125/255, 1], [108/255, 91/255, 123/255, 1], normalizedValue);
  } else if (-1 <= clampedValue && clampedValue < -0.2) {
    const normalizedValue = (clampedValue + 1) / .8;
    return lerpRGB([25/255, 25/255, 50/255, 1], [53/255, 92/255, 125/255, 1], normalizedValue);
  }
  return [0, 0, 0, 1];
}

function uniformRV(start, end) {
  return start + Math.random() * (end - start);
}

class MainScene extends Scene {
  constructor() {
    super();

    this.widget_options = {
      make_controls: true,
      make_code_nav: false,
      make_editor: false,
      show_explanation: false,
    }

    this.settings = {
      fogColor: [240/255, 248/255, 255/255, 1],
      fogIntensity: 0.3,
      groundColor: [.5, .6, .4, 1],
      groundOptions: {
        columnDivisions: 20,
        rowDivisions: 15,
        bumpiness: 0.05,
        rowNoiseFactor: .7,
        colNoiseFactor: .7,
      },
      mountainColor: [.1, .1, .1, 1],
      mountainOptions: {
        columnDivisions: 10,
        rowDivisions: 10,
        bumpiness: 0.25,
        rowNoiseFactor: .7,
        colNoiseFactor: .7,
      },
      sunColor: [1, 1, 1, 1],
      sunlightColor: [255/255, 244/255, 229/255, 1],
      moonColor: [255/255, 244/255, 229/255, 1],
      moonlightColor: [.7, .7, 1, 1],
      rotationsPerMinute: 1,
      initialSunOffset: 11 * Math.PI / 8,
      leafOptions: {
        numberOfLeaves: 10,
        initialReleaseInterval: 0.5,
        releaseIntervalNoiseRange: [0, 0.25],
        baseVelocity: [0, 1, 4],
        noiseRange: {
          x: [0, 1],
          y: [0, 1],
          z: [-1, 1],
        },
        sizeRange: [0.15, .85],
        colorRange: {
          r: [0, .6],
          g: [.3, .6],
          b: [0, .5],
          a: [.5, 1],
        },
        baseRotationSpeed: 0.01,
        rotationNoiseRange: [0, 0.05],
        decaySpeed: 0.005,
        removalThreshold: 0.05,
      },
      treeOptions: {
        initialDirectionVector: vec3(0, 1, 0),
        baseLength: 6,
        baseRadius: 1,
        cutoffThreshold: 1.25,
        leafThreshold: 2,
        lengthDecayRate: 0.9,
        radiusDecayRate: .5,
        minSplitAngle: 0,
        maxSplitAngle: Math.PI / 2.5,
        branchLengthLowerBoundFactor: 0.75,
        extraTrunkLength: 2,
        useSmoothShading: true,
        leafSizeRange: [.15, 1.5],
      },
    }

    this.shapes = {
      leaf: new _shapes_leaf_js__WEBPACK_IMPORTED_MODULE_4__["default"](),
      sphere: new _shapes_subdivision_sphere_js__WEBPACK_IMPORTED_MODULE_6__["default"](4),
      cube: new _shapes_cube_js__WEBPACK_IMPORTED_MODULE_7__["default"](),
      offsetSquare: new _shapes_offset_square_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.settings.groundOptions),
      offsetSquare2: new _shapes_offset_square_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.settings.mountainOptions),
      treebark: new _shapes_tree_bark_js__WEBPACK_IMPORTED_MODULE_8__["default"](1 - this.settings.treeOptions.radiusDecayRate, this.settings.treeOptions.useSmoothShading),
    };

    this.shaders = {
      phongWithFog: new _shaders_phong_with_fog_shader_js__WEBPACK_IMPORTED_MODULE_3__["default"](2, color(...this.settings.fogColor), this.settings.fogIntensity),
      phong: new _shaders_phong_shader_js__WEBPACK_IMPORTED_MODULE_2__["default"](2), 
    }

    this.materials = {
      ground: new Material(this.shaders.phongWithFog, { ambient: 0, diffusivity: .7, specularity: .2, color: color(...this.settings.groundColor) }),
      mountain: new Material(this.shaders.phongWithFog, { ambient: 0, diffusivity: .9, specularity: .2, color: [.1, .1, .1, 1] }),
      metal: new Material(this.shaders.phongWithFog, { ambient: 0, diffusivity: .2, specularity: .95, color: color(.4, .4, .6, 1) }),
      sun: new Material(this.shaders.phong, { ambient: 1, diffusivity: 1, specularity: 0, color: color(...this.settings.sunColor) }),
      moon: new Material(this.shaders.phong, { ambient: 1, diffusivity: 1, specularity: 0, color: color(...this.settings.moonColor) }),
      leaf: new Material(this.shaders.phongWithFog, { ambient: .5, specularity: 0 }),
      tree: new Material(this.shaders.phongWithFog, {ambient: .3, diffusivity: .3, specularity: .01, color: color(.59, .29, 0, 1)}),
    };

    this.positions = {
      sun: [0, 0, 0, 1],
      moon: [0, 0, 0, 1],
    }

    this.particles = {
      leaves: []
    }

    const generatedTree = new _generate_tree_js__WEBPACK_IMPORTED_MODULE_9__["default"](this.settings.treeOptions).generateTree();
    this.branches = generatedTree.branches;
    this.leaves = generatedTree.leaves.map(leafPosition => {
      const uniqueLeaf = this.generateLeaf({sizeRange: this.settings.leafOptions.sizeRange}, true)
      uniqueLeaf.position = [...leafPosition];
      return uniqueLeaf;
    });

    this.initialized = false;
  }

  generateLeaf(overrideOptions = {}, isStatic = false) {
    const spawnRadius = 8;
    const uniformRadius = uniformRV(-1, 1) * spawnRadius;
    const {
      baseVelocity,
      noiseRange,
      sizeRange,
      colorRange,
    } = {...this.settings.leafOptions, ...overrideOptions};
    if (isStatic) {
      return {
        position: [0,0,0,1],
        size: uniformRV(...sizeRange),
        rotation: [uniformRV(0, Math.PI * 2), Math.random(), Math.random(), Math.random()],
        color: [
          uniformRV(...colorRange.r), 
          uniformRV(...colorRange.g), 
          uniformRV(...colorRange.b), 
          uniformRV(...colorRange.a)
        ],
      }
    }
    return { 
      position: [uniformRadius, 13 + uniformRadius, uniformRadius, 1], 
      size: uniformRV(...sizeRange), 
      rotation: [uniformRV(0, Math.PI * 2), Math.random(), Math.random(), Math.random()],
      color: [
        uniformRV(...colorRange.r), 
        uniformRV(...colorRange.g), 
        uniformRV(...colorRange.b), 
        uniformRV(...colorRange.a)
      ],
      velocity: [
        (baseVelocity[0] + uniformRV(...noiseRange.x)) / 100, 
        (baseVelocity[1] + uniformRV(...noiseRange.y)) / 100, 
        (baseVelocity[2] + uniformRV(...noiseRange.z)) / 100
      ],
    };
  }

  initializeScene(context, state) {
    state.lights = [
      new Light(vec4(...this.positions.sun), color(...this.settings.sunlightColor), 1000000000),
      new Light(vec4(...this.positions.sun), color(...this.settings.moonlightColor), 10000000),
    ];
    context.context.clearColor(...this.settings.fogColor);
    if (!context.scratchpad.controls) {
      context.scratchpad.controls = new _scene_components_js__WEBPACK_IMPORTED_MODULE_1__["Movement_Controls"]();
      this.children.push(context.scratchpad.controls);
      state.set_camera(Mat4.look_at(vec3(-35, 10, 0), vec3(50, 15, -20), vec3(0, 1, 0)));
    }
    state.projection_transform = Mat4.perspective(Math.PI/4, context.width/context.height, 1, 200);
    this.particles.leaves = [...Array(this.settings.leafOptions.numberOfLeaves)];
    this.particles.leaves.forEach((_, i) => {
      const {
        initialReleaseInterval,
        releaseIntervalNoiseRange,
      } = this.settings.leafOptions;
      setTimeout(() => this.particles.leaves[i] = this.generateLeaf(), 
      i * initialReleaseInterval * 1000 + uniformRV(...releaseIntervalNoiseRange) * 1000)
    })
    context.context.enable(context.context.CULL_FACE)
    context.context.cullFace(context.context.BACK);
    this.initialized = true;
  }

  updateTerrain(context, state) {
    const ground_matrix = Mat4.identity()
      .times(Mat4.scale(60, 60, 60))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
    this.shapes.offsetSquare.draw(context, state, ground_matrix, this.materials.ground);
    const mountain_matrix = Mat4.identity()
    .times(Mat4.translation(-50, 10, -30))
    .times(Mat4.scale(60, 60, 60))
     .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
    .times(Mat4.rotation(-Math.PI / 3, 1, 0, 0))
    this.shapes.offsetSquare2.draw(context, state, mountain_matrix, this.materials.mountain);
  }

  updateSun(context, state) {
    const sunlightIntensity = Math.max(100000, this.positions.sun[1] * 10000000);
    state.lights[0] = new Light(vec4(...this.positions.sun), color(...this.settings.sunlightColor), sunlightIntensity);
    const sunMatrix = Mat4.identity()
      .times(Mat4.rotation(this.settings.initialSunOffset + 2 * Math.PI * (state.animation_time / 1000) * (this.settings.rotationsPerMinute / 60), 1, 0, 1))
      .times(Mat4.translation(0, 75, 0))
      .times(Mat4.scale(2, 2, 2))
    this.positions.sun = [...sunMatrix.times(vec4(0, 0, 0, 1))]
    this.shapes.sphere.draw(context, state, sunMatrix, this.materials.sun );
  }

  updateMoon(context, state) {
    const moonlightIntensity = Math.max(100000, this.positions.moon[1] * 100000);
    state.lights[1] = new Light(vec4(...this.positions.moon), color(...this.settings.moonlightColor), moonlightIntensity);
    const moonMatrix = Mat4.identity()
      .times(Mat4.rotation(this.settings.initialSunOffset + 2 * Math.PI * (state.animation_time / 1000) * (this.settings.rotationsPerMinute / 60), 1, 0, 1))
      .times(Mat4.translation(0, -75, 0))
      .times(Mat4.scale(1, 1, 1))
    this.positions.moon = [...moonMatrix.times(vec4(0, 0, 0, 1))];
    this.shapes.sphere.draw(context, state, moonMatrix, this.materials.moon );
  }

  updateSky(context, state) {
    const updatedFogColor = getColorFromSpectrum(this.positions.sun[1] / 50);
    this.materials.ground.shader.fogColor = color(...updatedFogColor);
    this.materials.ground.specularity = Math.max(0, this.positions.sun[1] / 50) / 2;
    this.materials.mountain.specularity = Math.max(0, this.positions.sun[1] / 50) / 2;
    this.materials.metal.specularity = Math.max(0, this.positions.sun[1] / 50) / 2;
    this.materials.ground.ambient = Math.max(0.1, this.positions.sun[1] / 50) / 2;
    this.materials.mountain.ambient = Math.max(0.1, this.positions.sun[1] / 50) / 2;
    this.materials.metal.ambient = Math.max(0.1, this.positions.sun[1] / 50) / 2;
    this.materials.tree.ambient = Math.max(0.1, this.positions.sun[1] / 50) / 2;

    context.context.clearColor(...updatedFogColor);
  }

  updateFlyingLeaves(context, state) {
    for (let i = 0; i < this.particles.leaves.length; i++) {
      const currentLeaf = this.particles.leaves[i];
      if (currentLeaf == null) continue;
      const {
        baseRotationSpeed,
        rotationNoiseRange,
        decaySpeed,
        removalThreshold,
      } = this.settings.leafOptions;
      if (currentLeaf.size <= removalThreshold) {
        this.particles.leaves[i] = this.generateLeaf()
      }

      currentLeaf.position[0] += currentLeaf.velocity[0]
      currentLeaf.position[1] += currentLeaf.velocity[1]
      currentLeaf.position[2] += currentLeaf.velocity[2]
      currentLeaf.size = lerp(currentLeaf.size, 0, decaySpeed);
      currentLeaf.rotation[0] += baseRotationSpeed + uniformRV(...rotationNoiseRange);
      const matrix = Mat4.translation(...currentLeaf.position)
        .times(Mat4.scale(currentLeaf.size, currentLeaf.size, currentLeaf.size))
        .times(Mat4.rotation(...currentLeaf.rotation))

      context.context.disable(context.context.CULL_FACE)
      this.shapes.leaf.draw(context, state, matrix, this.materials.leaf.override({color: currentLeaf.color}));
      context.context.enable(context.context.CULL_FACE)
    }
  }

  updateTree(context, state) {
    for (const branch of this.branches) {
      const normalizedDirection = branch.directionVector.normalized();
      const rotationAxis = normalizedDirection.cross(vec3(0,1,0));
      const rotationMatrix = normalizedDirection.equals(vec3(0,1,0)) ? Mat4.rotation(0,0,1,0) : Mat4.rotation(-Math.acos(normalizedDirection.dot(vec3(0,1,0))), ...rotationAxis);
      const matrix = Mat4.identity()
        .times(Mat4.translation(...branch.rootPosition))
        .times(rotationMatrix)
        .times(Mat4.scale(branch.radius, branch.height, branch.radius))
      this.shapes.treebark.draw(context, state, matrix, this.materials.tree.override({color: color(.6,.3, .45, 1)}));
    }
    for (const currentLeaf of this.leaves) {
      const matrix = Mat4.translation(...currentLeaf.position)
        .times(Mat4.scale(currentLeaf.size, currentLeaf.size, currentLeaf.size))
        .times(Mat4.rotation(...currentLeaf.rotation))

      context.context.disable(context.context.CULL_FACE)
      this.shapes.leaf.draw(context, state, matrix, this.materials.leaf.override({color: currentLeaf.color}));
      context.context.enable(context.context.CULL_FACE)
    }
  }

  display(context, state) {
    if (!this.initialized) this.initializeScene(context, state);
    this.updateSun(context, state);
    this.updateMoon(context, state);
    this.updateTerrain(context, state);
    this.updateSky(context, state); 
    this.updateFlyingLeaves(context, state);
    this.updateTree(context, state);
  }

  make_control_panel() {
    this.live_string(elem => {elem.textContent = `Leaf size lower bound: ${this.settings.leafOptions.sizeRange[0].toFixed(3)}`});
    this.new_line()
    this.live_string(elem => {elem.textContent = `Leaf size upper bound: ${this.settings.leafOptions.sizeRange[1].toFixed(3)}`});
    this.new_line();
    this.key_triggered_button('Increase leaf size lower bound', [''], () => this.settings.leafOptions.sizeRange[0] += 0.1);
    this.key_triggered_button('Increase leaf size upper bound', [''], () => this.settings.leafOptions.sizeRange[1] += 0.1);
    this.new_line();
    this.live_string(elem => {elem.textContent = `Day/night cycles per minute: ${this.settings.rotationsPerMinute.toFixed(3)}`});
    this.new_line();
    this.key_triggered_button('Increase day/night speed', [''], () => this.settings.rotationsPerMinute += .1);
    this.key_triggered_button('Decrease day/night speed', [''], () => this.settings.rotationsPerMinute -= .1);
    this.new_line();
    this.live_string(elem => { elem.textContent = `Ground Bumpiness: ${this.settings.groundOptions.bumpiness.toFixed(3)}`});
    this.new_line();
    this.live_string(elem => { 
      elem.textContent = `
        Row Divisions: ${this.settings.groundOptions.rowDivisions.toFixed(3)}
        Column Divisions: ${this.settings.groundOptions.columnDivisions.toFixed(3)}
      `
    });
    this.new_line();
    this.live_string(elem => { 
      elem.textContent = `
        Row Noise: ${this.settings.groundOptions.rowNoiseFactor.toFixed(3)}
        Column Noise: ${this.settings.groundOptions.colNoiseFactor.toFixed(3)}
      `
    });
    this.new_line();
    this.key_triggered_button('Generate new ground', [''], () => { this.shapes.offsetSquare = new _shapes_offset_square_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.settings.groundOptions) });
    this.key_triggered_button('(+) Bumpiness', [''], () => { this.settings.groundOptions.bumpiness += 0.01 });
    this.key_triggered_button('(-) Bumpiness', [''], () => { this.settings.groundOptions.bumpiness -= 0.01 });
    this.key_triggered_button('(+) Row Divisions', [''], () => { this.settings.groundOptions.rowDivisions += 1 });
    this.key_triggered_button('(-) Row Divisions', [''], () => { this.settings.groundOptions.rowDivisions -= 1 });
    this.key_triggered_button('(+) Column Divisions', [''], () => { this.settings.groundOptions.columnDivisions += 1 });
    this.key_triggered_button('(-) Column Divisions', [''], () => { this.settings.groundOptions.columnDivisions -= 1 });
    this.key_triggered_button('(+) Row Noise', [''], () => { this.settings.groundOptions.rowNoiseFactor += 0.01 });
    this.key_triggered_button('(-) Row Noise', [''], () => { this.settings.groundOptions.rowNoiseFactor -= 0.01 });
    this.key_triggered_button('(+) Column Noise', [''], () => { this.settings.groundOptions.colNoiseFactor += 0.01 });
    this.key_triggered_button('(-) Column Noise', [''], () => { this.settings.groundOptions.colNoiseFactor -= 0.01 });
    this.key_triggered_button('Generate new mountain', [''], () => { this.shapes.offsetSquare2 = new _shapes_offset_square_js__WEBPACK_IMPORTED_MODULE_5__["default"](this.settings.mountainOptions) });
    this.key_triggered_button('Generate new tree', [''], () => { 
      const newTree = new _generate_tree_js__WEBPACK_IMPORTED_MODULE_9__["default"](this.settings.treeOptions).generateTree();
      this.branches = newTree.branches;
      this.leaves = newTree.leaves.map(leafPosition => {
        const uniqueLeaf = this.generateLeaf({sizeRange: this.settings.leafOptions.sizeRange}, true)
        uniqueLeaf.position = [...leafPosition];
        return uniqueLeaf;
      });
    });
    this.key_triggered_button('Toggle tree shading', [''], () => {
      this.settings.treeOptions.useSmoothShading = !this.settings.treeOptions.useSmoothShading;
      this.shapes.treebark = new _shapes_tree_bark_js__WEBPACK_IMPORTED_MODULE_8__["default"](1 - this.settings.treeOptions.radiusDecayRate, this.settings.treeOptions.useSmoothShading)
    })
  }
}

/* harmony default export */ __webpack_exports__["default"] = (MainScene);

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./index.css":
/*!*********************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./index.css ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, "* {\r\n  box-sizing: border-box;\r\n  margin: 0;\r\n  padding: 0;\r\n}\r\n\r\nbody {\r\n  background: #eee;\r\n}\r\n\r\n.container {\r\n  margin: 50px auto;\r\n  display: flex;\r\n  justify-content: center;\r\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./scene-components.js":
/*!*****************************!*\
  !*** ./scene-components.js ***!
  \*****************************/
/*! exports provided: Movement_Controls, Program_State_Viewer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Movement_Controls", function() { return Movement_Controls; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Program_State_Viewer", function() { return Program_State_Viewer; });
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tiny-graphics.js */ "./tiny-graphics.js");


const { 
  Scene, vec, vec3, vec4, Mat4,
} = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

class Program_State_Viewer extends Scene
{                                             // **Program_State_Viewer** just toggles, monitors, and reports some
                                              // global values via its control panel.
  make_control_panel()
    {                         // display() of this scene will replace the following object:
      this.program_state = {};
      this.key_triggered_button( "(Un)pause animation", ["Alt", "a"], () => this.program_state.animate ^= 1 );    
    }
  display( context, program_state )
    { this.program_state = program_state;      
    }
}

class Movement_Controls extends Scene
{                                       // **Movement_Controls** is a Scene that can be attached to a canvas, like any other
                                        // Scene, but it is a Secondary Scene Component -- meant to stack alongside other 
                                        // scenes.  Rather than drawing anything it embeds both first-person and third-
                                        // person style controls into the website.  These can be used to manually move your
                                        // camera or other objects smoothly through your scene using key, mouse, and HTML
                                        // button controls to help you explore what's in it.
  constructor()
    { super();
      const data_members = { roll: 0, look_around_locked: true, 
                             thrust: vec3( 0,0,0 ), pos: vec3( 0,0,0 ), z_axis: vec3( 0,0,0 ),
                             radians_per_frame: 1/200, meters_per_frame: 20, speed_multiplier: 1 };
      Object.assign( this, data_members );

      this.mouse_enabled_canvases = new Set();
      this.will_take_over_graphics_state = true;
    }
  set_recipient( matrix_closure, inverse_closure )
    {                               // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
                                    // instead, track an external target matrix to modify.  Targets must be pointer references
                                    // made using closures.
      this.matrix  =  matrix_closure;
      this.inverse = inverse_closure;
    }
  reset( graphics_state )
    {                         // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
                              // encountered program_state object.  Targets must be pointer references made using closures.
      this.set_recipient( () => graphics_state.camera_transform, 
                          () => graphics_state.camera_inverse   );
    }
  add_mouse_controls( canvas )
    {                                       // add_mouse_controls():  Attach HTML mouse events to the drawing canvas.
                                            // First, measure mouse steering, for rotating the flyaround camera:
      this.mouse = { "from_center": vec( 0,0 ) };
      const mouse_position = ( e, rect = canvas.getBoundingClientRect() ) => 
                                   vec( e.clientX - (rect.left + rect.right)/2, e.clientY - (rect.bottom + rect.top)/2 );
                                // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas:
      document.addEventListener( "mouseup",   e => { this.mouse.anchor = undefined; } );
      canvas  .addEventListener( "mousedown", e => { e.preventDefault(); this.mouse.anchor      = mouse_position(e); } );
      canvas  .addEventListener( "mousemove", e => { e.preventDefault(); this.mouse.from_center = mouse_position(e); } );
      canvas  .addEventListener( "mouseout",  e => { if( !this.mouse.anchor ) this.mouse.from_center.scale_by(0) } );
    }
  show_explanation( document_element ) { }
  make_control_panel()
    {                                 // make_control_panel(): Sets up a panel of interactive HTML elements, including
                                      // buttons with key bindings for affecting this scene, and live info readouts.
      this.control_panel.innerHTML += "Click and drag the scene to <br> spin your viewpoint around it.<br>";
      this.key_triggered_button( "Up",     [ " " ], () => this.thrust[1] = -1, undefined, () => this.thrust[1] = 0 );
      this.key_triggered_button( "Forward",[ "w" ], () => this.thrust[2] =  1, undefined, () => this.thrust[2] = 0 );
      this.new_line();
      this.key_triggered_button( "Left",   [ "a" ], () => this.thrust[0] =  1, undefined, () => this.thrust[0] = 0 );
      this.key_triggered_button( "Back",   [ "s" ], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0 );
      this.key_triggered_button( "Right",  [ "d" ], () => this.thrust[0] = -1, undefined, () => this.thrust[0] = 0 );
      this.new_line();
      this.key_triggered_button( "Down",   [ "z" ], () => this.thrust[1] =  1, undefined, () => this.thrust[1] = 0 ); 

      const speed_controls = this.control_panel.appendChild( document.createElement( "span" ) );
      speed_controls.style.margin = "30px";
      this.key_triggered_button( "-",  [ "o" ], () => 
                                            this.speed_multiplier  /=  1.2, "green", undefined, undefined, speed_controls );
      this.live_string( box => { box.textContent = "Speed: " + this.speed_multiplier.toFixed(2) }, speed_controls );
      this.key_triggered_button( "+",  [ "p" ], () => 
                                            this.speed_multiplier  *=  1.2, "green", undefined, undefined, speed_controls );
      this.new_line();
      this.key_triggered_button( "Roll left",  [ "," ], () => this.roll =  1, undefined, () => this.roll = 0 );
      this.key_triggered_button( "Roll right", [ "." ], () => this.roll = -1, undefined, () => this.roll = 0 );
      this.new_line();
      this.key_triggered_button( "(Un)freeze mouse look around", [ "f" ], () => this.look_around_locked ^=  1, "green" );
      this.new_line();
      this.live_string( box => box.textContent = "Position: " + this.pos[0].toFixed(2) + ", " + this.pos[1].toFixed(2) 
                                                       + ", " + this.pos[2].toFixed(2) );
      this.new_line();
                                                  // The facing directions are surprisingly affected by the left hand rule:
      this.live_string( box => box.textContent = "Facing: " + ( ( this.z_axis[0] > 0 ? "West " : "East ")
                   + ( this.z_axis[1] > 0 ? "Down " : "Up " ) + ( this.z_axis[2] > 0 ? "North" : "South" ) ) );
      this.new_line();
      this.key_triggered_button( "Go to world origin", [ "r" ], () => { this. matrix().set_identity( 4,4 );
                                                                        this.inverse().set_identity( 4,4 ) }, "orange" );
      this.new_line();

      this.key_triggered_button( "Look at origin from front", [ "1" ], () =>
        { this.inverse().set( Mat4.look_at( vec3( 0,0,10 ), vec3( 0,0,0 ), vec3( 0,1,0 ) ) );
          this. matrix().set( Mat4.inverse( this.inverse() ) );
        }, "black" );
      this.new_line();
      this.key_triggered_button( "from right", [ "2" ], () =>
        { this.inverse().set( Mat4.look_at( vec3( 10,0,0 ), vec3( 0,0,0 ), vec3( 0,1,0 ) ) );
          this. matrix().set( Mat4.inverse( this.inverse() ) );
        }, "black" );
      this.key_triggered_button( "from rear", [ "3" ], () =>
        { this.inverse().set( Mat4.look_at( vec3( 0,0,-10 ), vec3( 0,0,0 ), vec3( 0,1,0 ) ) );
          this. matrix().set( Mat4.inverse( this.inverse() ) );
        }, "black" );   
      this.key_triggered_button( "from left", [ "4" ], () =>
        { this.inverse().set( Mat4.look_at( vec3( -10,0,0 ), vec3( 0,0,0 ), vec3( 0,1,0 ) ) );
          this. matrix().set( Mat4.inverse( this.inverse() ) );
        }, "black" );
      this.new_line();
      this.key_triggered_button( "Attach to global camera", [ "Shift", "R" ],
                                                 () => { this.will_take_over_graphics_state = true }, "blue" );
      this.new_line();
    }
  first_person_flyaround( radians_per_frame, meters_per_frame, leeway = 70 )
    {                                                     // (Internal helper function)
                                                          // Compare mouse's location to all four corners of a dead box:
      const offsets_from_dead_box = { plus: [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ],
                                     minus: [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ] }; 
                                                          // Apply a camera rotation movement, but only when the mouse is
                                                          // past a minimum distance (leeway) from the canvas's center:
      if( !this.look_around_locked )
                                              // If steering, steer according to "mouse_from_center" vector, but don't
                                              // start increasing until outside a leeway window from the center.                                          
        for( let i = 0; i < 2; i++ )
        {                                     // The &&'s in the next line might zero the vectors out:
          let o = offsets_from_dead_box,
            velocity = ( ( o.minus[i] > 0 && o.minus[i] ) || ( o.plus[i] < 0 && o.plus[i] ) ) * radians_per_frame;
                                              // On X step, rotate around Y axis, and vice versa.
          this.matrix().post_multiply( Mat4.rotation( -velocity,   i, 1-i, 0 ) );
          this.inverse().pre_multiply( Mat4.rotation( +velocity,   i, 1-i, 0 ) );
        }
      this.matrix().post_multiply( Mat4.rotation( -.1 * this.roll,   0,0,1 ) );
      this.inverse().pre_multiply( Mat4.rotation( +.1 * this.roll,   0,0,1 ) );
                                    // Now apply translation movement of the camera, in the newest local coordinate frame.
      this.matrix().post_multiply( Mat4.translation( ...this.thrust.times( -meters_per_frame ) ) );
      this.inverse().pre_multiply( Mat4.translation( ...this.thrust.times( +meters_per_frame ) ) );
    }
  third_person_arcball( radians_per_frame )
    {                                           // (Internal helper function)
                                                // Spin the scene around a point on an axis determined by user mouse drag:
      const dragging_vector = this.mouse.from_center.minus( this.mouse.anchor );
      if( dragging_vector.norm() <= 0 )
        return;
      this.matrix().post_multiply( Mat4.translation( 0,0, -25 ) );
      this.inverse().pre_multiply( Mat4.translation( 0,0, +25 ) );

      const rotation = Mat4.rotation( radians_per_frame * dragging_vector.norm(), 
                                                  dragging_vector[1], dragging_vector[0], 0 );
      this.matrix().post_multiply( rotation );
      this.inverse().pre_multiply( rotation );

      this. matrix().post_multiply( Mat4.translation( 0,0, +25 ) );
      this.inverse().pre_multiply(  Mat4.translation( 0,0, -25 ) );
    }
  display( context, graphics_state, dt = graphics_state.animation_delta_time / 1000 )
    {                                                            // The whole process of acting upon controls begins here.
      const m = this.speed_multiplier * this. meters_per_frame,
            r = this.speed_multiplier * this.radians_per_frame;

      if( this.will_take_over_graphics_state )
      { this.reset( graphics_state );
        this.will_take_over_graphics_state = false;
      }

      if( !this.mouse_enabled_canvases.has( context.canvas ) )
      { this.add_mouse_controls( context.canvas );
        this.mouse_enabled_canvases.add( context.canvas )
      }
                                     // Move in first-person.  Scale the normal camera aiming speed by dt for smoothness:
      this.first_person_flyaround( dt * r, dt * m );
                                     // Also apply third-person "arcball" camera mode if a mouse drag is occurring:
      if( this.mouse.anchor )
        this.third_person_arcball( dt * r );           
                                     // Log some values:
      this.pos    = this.inverse().times( vec4( 0,0,0,1 ) );
      this.z_axis = this.inverse().times( vec4( 0,0,1,0 ) );
    }
}



/***/ }),

/***/ "./shaders/phong-shader.js":
/*!*********************************!*\
  !*** ./shaders/phong-shader.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");

const { Shader, Matrix, color, vec4 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

// **Phong_Shader** is a subclass of Shader, which stores and maanges a GPU program.  
// Graphic cards prior to year 2000 had shaders like this one hard-coded into them
// instead of customizable shaders.  "Phong-Blinn" Shading here is a process of 
// determining brightness of pixels via vector math.  It compares the normal vector
// at that pixel with the vectors toward the camera and light sources.
class Phong_Shader extends Shader{                                  

  
  constructor( num_lights = 2 ) { 
    super(); 
    this.num_lights = num_lights;
  }

  shared_glsl_code()
    { return ` precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

                              // Specifier "varying" means a variable's final value will be passed from the vertex shader
                              // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
                              // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
                                             // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace )
          {                                        // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++)
              {
                            // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                            // light will appear directional (uniform direction from all points), and we 
                            // simply obtain a vector towards the light by directly using the stored value.
                            // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                            // the point light's location from the current surface point.  In either case, 
                            // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                                                  // Compute the diffuse and specular components from the Phong
                                                  // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;

                result += attenuation * light_contribution;
              }
            return result;
          } ` ;
    }
  vertex_glsl_code() { 
      return this.shared_glsl_code() + `
        attribute vec3 position, normal;                            // Position is expressed in object coordinates.
        
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main()
          {                                                                   // The vertex's final resting place (in NDCS):
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                                                                              // The final normal vector in screen space.
            N = normalize( mat3( model_transform ) * normal / squared_scale);
            
            vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
          } ` ;
    }

  fragment_glsl_code() {                          
      // A fragment is a pixel that's overlapped by the current triangle.
      // Fragments affect the final image or get discarded due to depth.                                 
      return this.shared_glsl_code() + `
        void main()
          {                                                           // Compute an initial (ambient) color:
            gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                                                                     // Compute the final color with contributions from lights:
            gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
          } ` ;
    }
  send_material( gl, gpu, material )
    {                                       // send_material(): Send the desired shape-wide material qualities to the
                                            // graphics card, where they will tweak the Phong lighting formula.                                      
      gl.uniform4fv( gpu.shape_color,    material.color       );
      gl.uniform1f ( gpu.ambient,        material.ambient     );
      gl.uniform1f ( gpu.diffusivity,    material.diffusivity );
      gl.uniform1f ( gpu.specularity,    material.specularity );
      gl.uniform1f ( gpu.smoothness,     material.smoothness  );
    }
  send_gpu_state( gl, gpu, gpu_state, model_transform )
    {                                       // send_gpu_state():  Send the state of our whole drawing context to the GPU.
      const O = vec4( 0,0,0,1 ), camera_center = gpu_state.camera_transform.times( O ).to3();
      gl.uniform3fv( gpu.camera_center, camera_center );
                                         // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
      const squared_scale = model_transform.reduce( 
                                         (acc,r) => { return acc.plus( vec4( ...r ).times_pairwise(r) ) }, vec4( 0,0,0,0 ) ).to3();                                            
      gl.uniform3fv( gpu.squared_scale, squared_scale );     
                                                      // Send the current matrices to the shader.  Go ahead and pre-compute
                                                      // the products we'll need of the of the three special matrices and just
                                                      // cache and send those.  They will be the same throughout this draw
                                                      // call, and thus across each instance of the vertex shader.
                                                      // Transpose them since the GPU expects matrices as column-major arrays.
      const PCM = gpu_state.projection_transform.times( gpu_state.camera_inverse ).times( model_transform );
      gl.uniformMatrix4fv( gpu.                  model_transform, false, Matrix.flatten_2D_to_1D( model_transform.transposed() ) );
      gl.uniformMatrix4fv( gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(             PCM.transposed() ) );

                                             // Omitting lights will show only the material color, scaled by the ambient term:
      if( !gpu_state.lights.length )
        return;

      const light_positions_flattened = [], light_colors_flattened = [];
      for( var i = 0; i < 4 * gpu_state.lights.length; i++ )
        { light_positions_flattened                  .push( gpu_state.lights[ Math.floor(i/4) ].position[i%4] );
          light_colors_flattened                     .push( gpu_state.lights[ Math.floor(i/4) ].color[i%4] );
        }      
      gl.uniform4fv( gpu.light_positions_or_vectors, light_positions_flattened );
      gl.uniform4fv( gpu.light_colors,               light_colors_flattened );
      gl.uniform1fv( gpu.light_attenuation_factors, gpu_state.lights.map( l => l.attenuation ) );
    }
  update_GPU( context, gpu_addresses, gpu_state, model_transform, material )
    {             // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader 
                  // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
                  // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or 
                  // program (which we call the "Program_State").  Send both a material and a program state to the shaders 
                  // within this function, one data field at a time, to fully initialize the shader for a draw.                  
      
                  // Fill in any missing fields in the Material object with custom defaults for this shader:
      const defaults = { color: color( 0,0,0,1 ), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40 };
      material = Object.assign( {}, defaults, material );
      this.send_material ( context, gpu_addresses, material );
      this.send_gpu_state( context, gpu_addresses, gpu_state, model_transform );
    }
}

/* harmony default export */ __webpack_exports__["default"] = (Phong_Shader);

/***/ }),

/***/ "./shaders/phong-with-fog-shader.js":
/*!******************************************!*\
  !*** ./shaders/phong-with-fog-shader.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");
/* harmony import */ var _phong_shader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./phong-shader.js */ "./shaders/phong-shader.js");

const { Matrix, color } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];




class Phong_With_Fog_Shader extends _phong_shader_js__WEBPACK_IMPORTED_MODULE_1__["default"] { 
  constructor(num_lights = 2, fogColor = color(0, 0, 0, 1), fogFactor = .5){ 
    super(num_lights); 
    this.fogColor = fogColor;
    this.fogFactor = fogFactor;
  }

  send_material( gl, gpu, material ) {                          
    super.send_material(gl, gpu, material);
    
  }

  send_gpu_state( gl, gpu, gpu_state, model_transform ) {   
    super.send_gpu_state(gl, gpu, gpu_state, model_transform);
    gl.uniformMatrix4fv( gpu.camera_transform, false, Matrix.flatten_2D_to_1D(gpu_state.camera_inverse.transposed()));
  }

  update_GPU( context, gpu_addresses, gpu_state, model_transform, material ) {
    super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);
    context.uniform1f (gpu_addresses.fogFactor, this.fogFactor);
    context.uniform4fv(gpu_addresses.fogColor, this.fogColor)
  }

  vertex_glsl_code() { 
    return this.shared_glsl_code() + `
      attribute vec3 position, normal; // Position is expressed in object coordinates.
      
      uniform mat4 model_transform;
      uniform mat4 projection_camera_model_transform;
      uniform mat4 camera_transform;

      varying float camera_depth;

      void main() {  
        // The vertex's final resting place (in NDCS):
        gl_Position = projection_camera_model_transform * vec4(position, 1.0);
        camera_depth = -1.0 * (camera_transform * model_transform * vec4(position, 1)).z;
        
        // The final normal vector in screen space.
        N = normalize(mat3(model_transform) * normal / squared_scale);
        
        vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
      } 
    `;
  }

  fragment_glsl_code() {                           
    return this.shared_glsl_code() + `
      varying float camera_depth;

      uniform float fogFactor;
      uniform vec4 fogColor;

      void main(){
        float fogIntensity = 1.0 - smoothstep(0.0, 1.0, (fogFactor * camera_depth) / 25.0);
        gl_FragColor = vec4(shape_color.xyz * ambient, shape_color.w);
        gl_FragColor.xyz += phong_model_lights(normalize(N), vertex_worldspace);
        gl_FragColor = mix(fogColor, gl_FragColor, fogIntensity);
      }
    `;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Phong_With_Fog_Shader);

/***/ }),

/***/ "./shapes/cube.js":
/*!************************!*\
  !*** ./shapes/cube.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");
/* harmony import */ var _square_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./square.js */ "./shapes/square.js");

const { Shape, Mat4 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];



// **Cube** A closed 3D shape, and the first example of a compound shape (a Shape constructed
// out of other Shapes).  A cube inserts six Square strips into its own arrays, using six
// different matrices as offsets for each square.
class Cube extends Shape {                         
  constructor() { 
    super( "position", "normal", "texture_coord" );
      // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
      for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 2; j++ ) { 
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0,    1,0,0 )
            .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ),   0,1,0 ) )
            .times( Mat4.translation( 0,0,1 ) );

          // Calling this function of a Square (or any Shape) copies it into the specified
          // Shape (this one) at the specified matrix offset (square_transform):
          _square_js__WEBPACK_IMPORTED_MODULE_1__["default"].insert_transformed_copy_into( this, [], square_transform );
        }
    }
}

/* harmony default export */ __webpack_exports__["default"] = (Cube);

/***/ }),

/***/ "./shapes/leaf.js":
/*!************************!*\
  !*** ./shapes/leaf.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");


const { Shape, Vector, vec3 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

class Leaf extends Shape {                                 
  constructor() {
      super( "position", "normal", "texture_coord" );
      this.arrays.position = [ vec3(-.5,0,.1), vec3(0,0,0), vec3(0,0.866,0), vec3(.5,0,.1)];
      this.arrays.normal = [ vec3(0,0,1), vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) ];
      this.indices = [ 0, 1, 2, 1, 3, 2 ];
    }
}

/* harmony default export */ __webpack_exports__["default"] = (Leaf);

/***/ }),

/***/ "./shapes/offset-square.js":
/*!*********************************!*\
  !*** ./shapes/offset-square.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");

const { Shape, vec3 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

/**
 * options: Object
 * |-columnDivisions: number - Greater than 0
 * |-rowDivisions: number - Greater than 0
 * |-bumpiness: number - Between 0 and 1
 * |   Vertex offsets normal to flat square shape
 * |-colNoiseFactor: number - Between 0 and 1
 * |   Randomness in location of column vertices
 * |-rowNoiseFactor: number - Between 0 and 1
 * |   Randomness in location of row vertices
 */
class OffsetSquare extends Shape {
  constructor(options = {}) {
    const {
      columnDivisions = 6,
      rowDivisions = 6,
      bumpiness = 1,
      colNoiseFactor = 0.5,
      rowNoiseFactor = 0.5,
    } = options;
    super( "position", "normal");
    const columnDivisionIndices = this.subdivideNegOneToOne(columnDivisions)
    const rowDivisionIndicies = this.subdivideNegOneToOne(rowDivisions);
    const vertexRows = rowDivisionIndicies
      .reverse()
      .map((rowIndex) => {
        return columnDivisionIndices.map(colIndex => {
          const colNoise = colIndex === 1 || colIndex === -1 ? 0 : this.generateNoise(columnDivisions, colNoiseFactor);
          const rowNoise = rowIndex === 1 || rowIndex === -1 ? 0 : this.generateNoise(rowDivisions, rowNoiseFactor);
          return [colIndex + colNoise, rowIndex + rowNoise, Math.random() * bumpiness];
        })
      });
    const verticies = [];
    const normals = [];
    for (let i = 0; i < columnDivisions; i++) {
      for (let j = 0; j < rowDivisions; j++) {
        verticies.push(vec3(...vertexRows[j][i+1]), vec3(...vertexRows[j][i]), vec3(...vertexRows[j+1][i]));
        const firstNormal = this.getNormalFromTopOfVertexList(verticies);
        normals.push(firstNormal, firstNormal, firstNormal);
        verticies.push(vec3(...vertexRows[j+1][i]), vec3(...vertexRows[j+1][i+1]), vec3(...vertexRows[j][i+1]));
        const secondNormal = this.getNormalFromTopOfVertexList(verticies);
        normals.push(secondNormal, secondNormal, secondNormal);
      }
    }
    this.arrays.position = verticies;
    this.arrays.normal = normals;
  }

  generateNoise(numOfDivisions, noiseFactor) {
    return (((1 / numOfDivisions) * 2 * Math.random() - (1 / numOfDivisions))) * noiseFactor;
  }

  subdivideNegOneToOne(numOfDivisions) {
    const divisions = [...Array(numOfDivisions)].map((_, i) => ((2/numOfDivisions) * i) - 1);
    divisions.push(1);
    return divisions;
  }

  getNormalFromTopOfVertexList(verticies) {
    const firstVector = verticies[verticies.length - 3].minus(verticies[verticies.length - 2]);
    const secondVector = verticies[verticies.length - 2].minus(verticies[verticies.length - 1]);
    const normal = firstVector.cross(secondVector).normalized();
    return normal;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (OffsetSquare);

/***/ }),

/***/ "./shapes/square.js":
/*!**************************!*\
  !*** ./shapes/square.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");

const { Shape, Vector, Vector3 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

/**
 * **Square** demonstrates two triangles that share vertices.  On any planar surface, the 
 * interior edges don't make any important seams.  In these cases there's no reason not
 * to re-use data of the common vertices between triangles.  This makes all the vertex 
 * arrays (position, normals, etc) smaller and more cache friendly.
 */
class Square extends Shape {                                 
  constructor() { 
    super( "position", "normal", "texture_coord" );                           
    this.arrays.position = Vector3.cast([-1,-1,0], [1,-1,0], [-1,1,0], [1,1,0]);
    this.arrays.normal = Vector3.cast([0,0,1], [0,0,1], [0,0,1], [0,0,1]);
    this.arrays.texture_coord = Vector.cast([0,0], [1,0], [0,1], [1,1]);
    this.indices.push(0, 1, 2, 1, 3, 2);
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Square);

/***/ }),

/***/ "./shapes/subdivision-sphere.js":
/*!**************************************!*\
  !*** ./shapes/subdivision-sphere.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");

const { Shape, vec, Vector, Vector3 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];

// **Subdivision_Sphere** defines a Sphere surface, with nice uniform triangles.  A subdivision surface
// (see Wikipedia article on those) is initially simple, then builds itself into a more and more 
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
// some desired mathematical surface by projecting each new point onto that surface's known 
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
class Subdivision_Sphere extends Shape {                       
  constructor( max_subdivisions ) { 
    super( "position", "normal", "texture_coord" );                          
    // Start from the following equilateral tetrahedron:
    const tetrahedron = [ [ 0, 0, -1 ], [ 0, .9428, .3333 ], [ -.8165, -.4714, .3333 ], [ .8165, -.4714, .3333 ] ];
    this.arrays.position = Vector3.cast( ...tetrahedron );

    // Begin recursion:
    this.subdivide_triangle( 0, 1, 2, max_subdivisions);
    this.subdivide_triangle( 3, 2, 1, max_subdivisions);
    this.subdivide_triangle( 1, 0, 3, max_subdivisions);
    this.subdivide_triangle( 0, 2, 3, max_subdivisions);
    
    // With positions calculated, fill in normals and texture_coords of the finished Sphere:
    for( let p of this.arrays.position ) {
      // Each point has a normal vector that simply goes to the point from the origin:
      this.arrays.normal.push( p.copy() );

      // Textures are tricky.  A Subdivision sphere has no straight seams to which image 
      // edges in UV space can be mapped.  The only way to avoid artifacts is to smoothly
      // wrap & unwrap the image in reverse - displaying the texture twice on the sphere.                                                        
      //  this.arrays.texture_coord.push( Vector.of( Math.asin( p[0]/Math.PI ) + .5, Math.asin( p[1]/Math.PI ) + .5 ) );
      this.arrays.texture_coord.push(Vector.of(0.5 - Math.atan2(p[2], p[0]) / (2 * Math.PI), 0.5 + Math.asin(p[1]) / Math.PI) );
    }

    // Fix the UV seam by duplicating vertices with offset UV:
    const tex = this.arrays.texture_coord;
    for (let i = 0; i < this.indices.length; i += 3) {
      const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
      if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
        && [a, b, c].some(x => tex[x][0] < 0.5)) {
        for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
          if (tex[q[0]][0] < 0.5) {
            this.indices[q[1]] = this.arrays.position.length;
            this.arrays.position.push( this.arrays.position[q[0]].copy());
            this.arrays.normal  .push( this.arrays.normal  [q[0]].copy());
            tex.push(tex[q[0]].plus( vec(1, 0) ));
          }
        }
      }
    }
  }

  // subdivide_triangle(): Recurse through each level of detail 
  // by splitting triangle (a,b,c) into four smaller ones.
  subdivide_triangle( a, b, c, count ) {  

    // Base case of recursion - we've hit the finest level of detail we want.                               
    if( count <= 0) {
      this.indices.push( a,b,c ); 
      return; 
    }

    // So we're not at the base case.  So, build 3 new vertices at midpoints,
    // and extrude them out to touch the unit sphere (length 1).
    var ab_vert = this.arrays.position[a].mix( this.arrays.position[b], 0.5).normalized(),     
        ac_vert = this.arrays.position[a].mix( this.arrays.position[c], 0.5).normalized(),
        bc_vert = this.arrays.position[b].mix( this.arrays.position[c], 0.5).normalized(); 

    // Here, push() returns the indices of the three new vertices (plus one).
    var ab = this.arrays.position.push( ab_vert ) - 1,
        ac = this.arrays.position.push( ac_vert ) - 1,  
        bc = this.arrays.position.push( bc_vert ) - 1;  

    // Recurse on four smaller triangles, and we're done.  Skipping every fourth vertex index in 
    // our list takes you down one level of detail, and so on, due to the way we're building it.
    this.subdivide_triangle( a, ab, ac,  count - 1 );
    this.subdivide_triangle( ab, b, bc,  count - 1 );
    this.subdivide_triangle( ac, bc, c,  count - 1 );
    this.subdivide_triangle( ab, bc, ac, count - 1 );
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Subdivision_Sphere);

/***/ }),

/***/ "./shapes/tree-bark.js":
/*!*****************************!*\
  !*** ./shapes/tree-bark.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tiny-graphics.js */ "./tiny-graphics.js");

const { Shape, Vector3, vec3 } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];


class TreeBark extends Shape {                                 
  constructor(topRatio = 0.5, useSmoothShading = true) { 
    super("position", "normal");                           
    this.arrays.position = Vector3.cast(
      [-1,0,0], [-.55,0,1], vec3(...[-1,1,0]).mix(vec3(0,1,0), topRatio),
      [-.55,0,1], vec3(...[-.55,1,1]).mix(vec3(0,1,0), topRatio), vec3(...[-1,1,0]).mix(vec3(0,1,0), topRatio),
      [-.55,0,1], [.55,0,1], vec3(...[-.55,1,1]).mix(vec3(0,1,0), topRatio),
      [.55,0,1], vec3(...[.55,1,1]).mix(vec3(0,1,0), topRatio), vec3(...[-.55,1,1]).mix(vec3(0,1,0), topRatio),
      [.55,0,1], [1,0,0], vec3(...[.55,1,1]).mix(vec3(0,1,0), topRatio),
      [1,0,0], vec3(...[1,1,0]).mix(vec3(0,1,0), topRatio), vec3(...[.55,1,1]).mix(vec3(0,1,0), topRatio),
      [1,0,0], [.55,0,-1], vec3(...[1,1,0]).mix(vec3(0,1,0), topRatio),
      [.55,0,-1], vec3(...[.55,1,-1]).mix(vec3(0,1,0), topRatio), vec3(...[1,1,0]).mix(vec3(0,1,0), topRatio),
      [.55,0,-1], [-.55,0,-1], vec3(...[.55,1,-1]).mix(vec3(0,1,0), topRatio),
      [-.55,0,-1], vec3(...[-.55,1,-1]).mix(vec3(0,1,0), topRatio), vec3(...[.55,1,-1]).mix(vec3(0,1,0), topRatio),
      [-.55,0,-1], [-1,0,0], vec3(...[-.55,1,-1]).mix(vec3(0,1,0), topRatio),
      [-1,0,0], vec3(...[-1,1,0]).mix(vec3(0,1,0), topRatio), vec3(...[-.55,1,-1]).mix(vec3(0,1,0), topRatio),
    );
    if (useSmoothShading) {
      this.arrays.normal = Vector3.cast(
        [-1,0,0], [-.55,0,1], [-1,0,0],
        [-.55,0,1], [-.55,0,1], [-1,0,0],
        [-.55,0,1], [.55,0,1], [-.55,0,1],
        [.55,0,1], [.55,0,1], [-.55,0,1],
        [.55,0,1], [1,0,0], [.55,0,1],
        [1,0,0], [1,0,0], [.55,0,1],
        [1,0,0], [.55,0,-1], [1,0,0],
        [.55,0,-1], [.55,0,-1], [1,0,0],
        [.55,0,-1], [-.55,0,-1], [.55,0,-1],
        [-.55,0,-1], [-.55,0,-1], [.55,0,-1],
        [-.55,0,-1], [-1,0,0], [-.55,0,-1],
        [-1,0,0], [-1,0,0], [-.55,0,-1],
      );
    } else {
      this.arrays.normal = Vector3.cast(
        [-.8,0,.45], [-.8,0,.45], [-.8,0,.45],
        [-.8,0,.45], [-.8,0,.45], [-.8,0,.45],
        [0,0,1], [0,0,1], [0,0,1],
        [0,0,1], [0,0,1], [0,0,1],
        [.8,0,.45], [.8,0,.45], [.8,0,.45],
        [.8,0,.45], [.8,0,.45], [.8,0,.45],
        [.8,0,-.45], [.8,0,-.45], [.8,0,-.45],
        [.8,0,-.45], [.8,0,-.45], [.8,0,-.45],
        [0,0,-1], [0,0,-1], [0,0,-1],
        [0,0,-1], [0,0,-1], [0,0,-1],
        [-.8,0,-.45], [-.8,0,-.45], [-.8,0,-.45],
        [-.8,0,-.45], [-.8,0,-.45], [-.8,0,-.45],
      );
    }
    this.arrays.normal = this.arrays.normal.map(normal => normal.normalized());
  }
}

/* harmony default export */ __webpack_exports__["default"] = (TreeBark);

/***/ }),

/***/ "./tiny-graphics-widgets.js":
/*!**********************************!*\
  !*** ./tiny-graphics-widgets.js ***!
  \**********************************/
/*! exports provided: widgets */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "widgets", function() { return widgets; });
/* harmony import */ var _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tiny-graphics.js */ "./tiny-graphics.js");
// This file defines a lot of panels that can be placed on websites to create interactive graphics programs that use tiny-graphics.js.


const { color, Scene } = _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"];           // Pull these names into this module's scope for convenience.

const widgets = {};

const Canvas_Widget = widgets.Canvas_Widget =
class Canvas_Widget
{                           // **Canvas_Widget** embeds a WebGL demo onto a website in place of the given placeholder document
                            // element.  It creates a WebGL canvas and loads onto it any initial Scene objects in the 
                            // arguments.  Optionally spawns a Text_Widget and Controls_Widget for showing more information
                            // or interactive UI buttons, divided into one panel per each loaded Scene.  You can use up to
                            // 16 Canvas_Widgets; browsers support up to 16 WebGL contexts per page.
  constructor( element, initial_scenes, options = {} )   
    { this.element = element;

      const defaults = { show_canvas: true, make_controls: true, show_explanation: true, 
                         make_editor: false, make_code_nav: true };
      if( initial_scenes && initial_scenes[0] )
        Object.assign( options, initial_scenes[0].widget_options );
      Object.assign( this, defaults, options )
      
      const rules = [ ".canvas-widget { width: 1080px; background: DimGray; margin:auto }",
                      ".canvas-widget canvas { width: 1080px; height: 600px; margin-bottom:-3px }" ];
                      
      if( document.styleSheets.length == 0 ) document.head.appendChild( document.createElement( "style" ) );
      for( const r of rules ) document.styleSheets[document.styleSheets.length - 1].insertRule( r, 0 )

                              // Fill in the document elements:
      if( this.show_explanation )
      { this.embedded_explanation_area = this.element.appendChild( document.createElement( "div" ) );
        this.embedded_explanation_area.className = "text-widget";
      }

      const canvas = this.element.appendChild( document.createElement( "canvas" ) );

      if( this.make_controls )
      { this.embedded_controls_area    = this.element.appendChild( document.createElement( "div" ) );
        this.embedded_controls_area.className = "controls-widget";
      }

      if( this.make_code_nav )
      { this.embedded_code_nav_area    = this.element.appendChild( document.createElement( "div" ) );
        this.embedded_code_nav_area.className = "code-widget";
      }

      if( this.make_editor )
      { this.embedded_editor_area      = this.element.appendChild( document.createElement( "div" ) );
        this.embedded_editor_area.className = "editor-widget";
      }

      if( !this.show_canvas )
        canvas.style.display = "none";

      this.webgl_manager = new _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"].Webgl_Manager( canvas, color( 0,0,0,1 ) );  // Second parameter sets background color.


                           // Add scenes and child widgets
      if( initial_scenes )
        this.webgl_manager.scenes.push( ...initial_scenes );

      const primary_scene = initial_scenes ? initial_scenes[0] : undefined;
      const additional_scenes = initial_scenes ? initial_scenes.slice(1) : [];
      const primary_scene_definiton = primary_scene ? primary_scene.constructor : undefined;
      if( this.show_explanation )
        this.embedded_explanation  = new Text_Widget( this.embedded_explanation_area, this.webgl_manager.scenes, this.webgl_manager );
      if( this.make_controls )
        this.embedded_controls     = new Controls_Widget( this.embedded_controls_area, this.webgl_manager.scenes );
      if( this.make_editor )
        this.embedded_editor       = new Editor_Widget( this.embedded_editor_area, primary_scene_definiton, this );
      if( this.make_code_nav )
        this.embedded_code_nav     = new Code_Widget( this.embedded_code_nav_area, primary_scene_definiton, 
                                     additional_scenes, { associated_editor: this.embedded_editor } );

                                       // Start WebGL initialization.  Note that render() will re-queue itself for continuous calls.
      this.webgl_manager.render();
    }
}


const Controls_Widget = widgets.Controls_Widget =
class Controls_Widget
{                                               // **Controls_Widget** adds an array of panels to the document, one per loaded
                                                // Scene object, each providing interactive elements such as buttons with key 
                                                // bindings, live readouts of Scene data members, etc.
  constructor( element, scenes )
    { const rules = [ ".controls-widget * { font-family: monospace }",
                      ".controls-widget div { background: white }",
                      ".controls-widget table { border-collapse: collapse; display:block; overflow-x: auto; }",
                      ".controls-widget table.control-box { width: 1080px; border:0; margin:0; max-height:380px; transition:.5s; overflow-y:scroll; background:DimGray }",
                      ".controls-widget table.control-box:hover { max-height:500px }",
                      ".controls-widget table.control-box td { overflow:hidden; border:0; background:DimGray; border-radius:30px }",
                      ".controls-widget table.control-box td .control-div { background: #EEEEEE; height:338px; padding: 5px 5px 5px 30px; box-shadow: 25px 0px 60px -15px inset }",
                      ".controls-widget table.control-box td * { background:transparent }",
                      ".controls-widget table.control-box .control-div td { border-radius:unset }",
                      ".controls-widget table.control-box .control-title { padding:7px 40px; color:white; background:DarkSlateGray; box-shadow: 25px 0px 70px -15px inset black }",
                      ".controls-widget *.live_string { display:inline-block; background:unset }",
                      ".dropdown { display:inline-block }",
                      ".dropdown-content { display:inline-block; transition:.2s; transform: scaleY(0); overflow:hidden; position: absolute; \
                                            z-index: 1; background:#E8F6FF; padding: 16px; margin-left:30px; min-width: 100px; \
                                            box-shadow: 5px 10px 16px 0px rgba(0,0,0,0.2) inset; border-radius:10px }",
                      ".dropdown-content a { color: black; padding: 4px 4px; display: block }",
                      ".dropdown a:hover { background: #f1f1f1 }",
                      ".controls-widget button { background: #4C9F50; color: white; padding: 6px; border-radius:9px; \
                                                box-shadow: 4px 6px 16px 0px rgba(0,0,0,0.3); transition: background .3s, transform .3s }",
                      ".controls-widget button:hover, button:focus { transform: scale(1.3); color:gold }",
                      ".link { text-decoration:underline; cursor: pointer }",
                      ".show { transform: scaleY(1); height:200px; overflow:auto }",
                      ".hide { transform: scaleY(0); height:0px; overflow:hidden  }" ];
                      
      const style = document.head.appendChild( document.createElement( "style" ) );
      for( const r of rules ) document.styleSheets[document.styleSheets.length - 1].insertRule( r, 0 )

      const table = element.appendChild( document.createElement( "table" ) );
      table.className = "control-box";
      this.row = table.insertRow( 0 );

      this.panels = [];
      this.scenes = scenes;

      this.render();
    }
  make_panels( time )
    { this.timestamp = time;
      this.row.innerHTML = "";
                                                        // Traverse all scenes and their children, recursively:
      const open_list = [ ...this.scenes ];
      while( open_list.length )                       
      { open_list.push( ...open_list[0].children );
        const scene = open_list.shift();

        const control_box = this.row.insertCell();
        this.panels.push( control_box );
                                                                                        // Draw top label bar:
        control_box.appendChild( Object.assign( document.createElement("div"), { 
                                      textContent: scene.constructor.name, className: "control-title" } ) )

        const control_panel = control_box.appendChild( document.createElement( "div" ) );
        control_panel.className = "control-div";
        scene.control_panel = control_panel;
        scene.timestamp = time;
                                                        // Draw each registered animation:
        scene.make_control_panel();                     
      }
    }
  render( time = 0 )
    {                       // Check to see if we need to re-create the panels due to any scene being new.                      
                            // Traverse all scenes and their children, recursively:
      const open_list = [ ...this.scenes ];
      while( open_list.length )                       
      { open_list.push( ...open_list[0].children );
        const scene = open_list.shift();
        if( !scene.timestamp || scene.timestamp > this.timestamp )        
        { this.make_panels( time );
          break;
        }

        // TODO: Check for updates to each scene's desired_controls_position, including if the 
        // scene just appeared in the tree, in which case call make_control_panel().
      }

      for( let panel of this.panels )
        for( let live_string of panel.querySelectorAll(".live_string") ) live_string.onload( live_string );
                                          // TODO: Cap this so that it can't be called faster than a human can read?
      this.event = window.requestAnimFrame( this.render.bind( this ) );
    }
}


const Code_Manager = widgets.Code_Manager =
class Code_Manager                     
{                                  // **Code_Manager** breaks up a string containing code (any ES6 JavaScript).  The RegEx being used
                                   // to parse is from https://github.com/lydell/js-tokens which states the following limitation:
                                   // "If the end of a statement looks like a regex literal (even if it isn’t), it will be treated
                                   // as one."  (This can miscolor lines of code containing divisions and comments).
  constructor( code )
    { const es6_tokens_parser = RegExp( [
        /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)/,    // Any string.
        /(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)/,                                                                           // Any comment (2 forms).  And next, any regex:
        /(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))/,
        /(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)/,                                     // Any number.
        /((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)/,                                          // Any name.
        /(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])/,                      // Any punctuator.
        /(\s+)|(^$|[\s\S])/                                                                                                   // Any whitespace. Lastly, blank/invalid.
          ].map( r => r.source ).join('|'), 'g' );

      this.tokens = [];    this.no_comments = [];    let single_token = null;
      while( ( single_token = es6_tokens_parser.exec( code ) ) !== null )
        { let token = { type: "invalid", value: single_token[0] }
               if ( single_token[  1 ] ) token.type = "string" , token.closed = !!( single_token[3] || single_token[4] )
          else if ( single_token[  5 ] ) token.type = "comment"
          else if ( single_token[  6 ] ) token.type = "comment", token.closed = !!single_token[7]
          else if ( single_token[  8 ] ) token.type = "regex"
          else if ( single_token[  9 ] ) token.type = "number"
          else if ( single_token[ 10 ] ) token.type = "name"
          else if ( single_token[ 11 ] ) token.type = "punctuator"
          else if ( single_token[ 12 ] ) token.type = "whitespace"        
          this.tokens.push( token )
          if( token.type != "whitespace" && token.type != "comment" ) this.no_comments.push( token.value );
        }  
    }
}


const Code_Widget = widgets.Code_Widget =
class Code_Widget
{                                         // **Code_Widget** draws a code navigator panel with inline links to the entire program source code.
  constructor( element, main_scene, additional_scenes, options = {} )
    { const rules = [ ".code-widget .code-panel { margin:auto; background:white; overflow:auto; font-family:monospace; width:1060px; padding:10px; padding-bottom:40px; max-height: 500px; \
                                                      border-radius:12px; box-shadow: 20px 20px 90px 0px powderblue inset, 5px 5px 30px 0px blue inset }",
                    ".code-widget .code-display { min-width:1200px; padding:10px; white-space:pre-wrap; background:transparent }",
                    ".code-widget table { display:block; margin:auto; overflow-x:auto; width:1080px; border-radius:25px; border-collapse:collapse; border: 2px solid black }",
                    ".code-widget table.class-list td { border-width:thin; background: #EEEEEE; padding:12px; font-family:monospace; border: 1px solid black }"
                     ];

      if( document.styleSheets.length == 0 ) document.head.appendChild( document.createElement( "style" ) );
      for( const r of rules ) document.styleSheets[document.styleSheets.length - 1].insertRule( r, 0 )

      this.associated_editor_widget = options.associated_editor;

      if( !main_scene )
        return;

      Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ./main-scene.js */ "./main-scene.js"))
        .then( module => { 
        
          this.build_reader(      element, main_scene, additional_scenes, module.defs );
          if( !options.hide_navigator )
            this.build_navigator( element, main_scene, additional_scenes, module.defs );
        } )
    }
  build_reader( element, main_scene, additional_scenes, definitions )
    {                                           // (Internal helper function)      
      this.definitions = definitions;
      const code_panel = element.appendChild( document.createElement( "div" ) );
      code_panel.className = "code-panel";
//       const text        = code_panel.appendChild( document.createElement( "p" ) );
//       text.textContent  = "Code for the above scene:";
      this.code_display = code_panel.appendChild( document.createElement( "div" ) );
      this.code_display.className = "code-display";
                                                                            // Default textbox contents:
      this.display_code( main_scene );
    }
  build_navigator( element, main_scene, additional_scenes, definitions )
    {                                           // (Internal helper function)
      const class_list = element.appendChild( document.createElement( "table" ) );
      class_list.className = "class-list";   
      const top_cell = class_list.insertRow( -1 ).insertCell( -1 );
      top_cell.colSpan = 2;
      top_cell.appendChild( document.createTextNode("Click below to navigate through all classes that are defined.") );
      const content = top_cell.appendChild( document.createElement( "p" ) );
      content.style = "text-align:center; margin:0; font-weight:bold";
      content.innerHTML = "main-scene.js<br>Main Scene: ";
      const main_scene_link = content.appendChild( document.createElement( "a" ) );
      main_scene_link.href = "javascript:void(0);"
      main_scene_link.addEventListener( 'click', () => this.display_code( main_scene ) );
      main_scene_link.textContent = main_scene.name;

      const second_cell = class_list.insertRow( -1 ).insertCell( -1 );
      second_cell.colSpan = 2;
      second_cell.style = "text-align:center; font-weight:bold";
      const index_src_link = second_cell.appendChild( document.createElement( "a" ) );
      index_src_link.href = "javascript:void(0);"
      index_src_link.addEventListener( 'click', () => this.display_code() );
      index_src_link.textContent = "This page's complete HTML source";

      const third_row = class_list.insertRow( -1 );
      third_row.style = "text-align:center";
      third_row.innerHTML = "<td><b>tiny-graphics.js</b><br>(Always the same)</td> \
                             <td><b>All other class definitions from dependencies:</td>";

      const fourth_row = class_list.insertRow( -1 );
                                                                            // Generate the navigator table of links:
      for( let list of [ _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"], definitions ] )
      { const cell = fourth_row.appendChild( document.createElement( "td" ) );
                                              // List all class names except the main one, which we'll display separately:
        const class_names = Object.keys( list ).filter( x => x != main_scene.name );
        cell.style = "white-space:normal"
        for( let name of class_names )
        { const class_link = cell.appendChild( document.createElement( "a" ) );
          class_link.style["margin-right"] = "80px"
          class_link.href = "javascript:void(0);"
          class_link.addEventListener( 'click', () => this.display_code( _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"][name] || definitions[name] ) );
          class_link.textContent = name;
          cell.appendChild( document.createTextNode(" ") );
        }
      }
    }
  display_code( class_to_display )
    {                                           // display_code():  Populate the code textbox.
                                                // Pass undefined to choose index.html source.
      if( this.associated_editor_widget ) 
        this.associated_editor_widget.select_class( class_to_display );
      if( class_to_display ) this.format_code( class_to_display.toString() );
      else fetch( document.location.href )
                .then(   response => response.text() )
                .then( pageSource => this.format_code( pageSource ) );
    }
  format_code( code_string )
    {                                           // (Internal helper function)
      this.code_display.innerHTML = "";
      const color_map = { string: "chocolate", comment: "green", regex: "blue", number: "magenta", 
                            name: "black", punctuator: "red", whitespace: "black" };

      for( let t of new Code_Manager( code_string ).tokens )
        if( t.type == "name" && [ ...Object.keys( _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"] ), ...Object.keys( this.definitions ) ].includes( t.value ) )
          { const link = this.code_display.appendChild( document.createElement( 'a' ) );
            link.href = "javascript:void(0);"
            link.addEventListener( 'click', () => this.display_code( _tiny_graphics_js__WEBPACK_IMPORTED_MODULE_0__["tiny"][t.value] || this.definitions[t.value] ) );
            link.textContent = t.value;
          }
        else
          { const span = this.code_display.appendChild( document.createElement( 'span' ) );
            span.style.color = color_map[t.type];
            span.textContent = t.value;
          }
    }
}


const Editor_Widget = widgets.Editor_Widget =
class Editor_Widget
{ constructor( element, initially_selected_class, canvas_widget, options = {} )
    { let rules = [ ".editor-widget { margin:auto; background:white; overflow:auto; font-family:monospace; width:1060px; padding:10px; \
                                      border-radius:12px; box-shadow: 20px 20px 90px 0px powderblue inset, 5px 5px 30px 0px blue inset }",
                    ".editor-widget button { background: #4C9F50; color: white; padding: 6px; border-radius:9px; margin-right:5px; \
                                             box-shadow: 4px 6px 16px 0px rgba(0,0,0,0.3); transition: background .3s, transform .3s }",
                    ".editor-widget input { margin-right:5px }",
                    ".editor-widget textarea { white-space:pre; width:1040px; margin-bottom:30px }",
                    ".editor-widget button:hover, button:focus { transform: scale(1.3); color:gold }"
                  ];

      for( const r of rules ) document.styleSheets[0].insertRule( r, 1 );

      this.associated_canvas = canvas_widget;
      this.options = options;

      const form = this.form = element.appendChild( document.createElement( "form" ) );
                                                          // Don't refresh the page on submit:
      form.addEventListener( 'submit', event => 
        { event.preventDefault(); this.submit_demo() }, false );    

      const explanation = form.appendChild( document.createElement( "p" ) );
      explanation.innerHTML = `<i><b>What can I put here?</b></i>  A JavaScript class, with any valid JavaScript inside.  Your code can use classes from this demo,
                               <br>or from ANY demo on Demopedia --  the dependencies will automatically be pulled in to run your demo!<br>`;
      
      const run_button = this.run_button = form.appendChild( document.createElement( "button" ) );
      run_button.type             = "button";
      run_button.style            = "background:maroon";
      run_button.textContent      = "Run with Changes";

      const submit = this.submit = form.appendChild( document.createElement( "button" ) );
      submit.type                 = "submit";
      submit.textContent          = "Save as New Webpage";

      const author_box = this.author_box = form.appendChild( document.createElement( "input" ) );
      author_box.name             = "author";
      author_box.type             = "text";
      author_box.placeholder      = "Author name";
      
      const password_box = this.password_box = form.appendChild( document.createElement( "input" ) );
      password_box.name           = "password";
      password_box.type           = "text";
      password_box.placeholder    = "Password";
      password_box.style          = "display:none";

      const overwrite_panel = this.overwrite_panel = form.appendChild( document.createElement( "span" ) );
      overwrite_panel.style       = "display:none";
      overwrite_panel.innerHTML   = "<label>Overwrite?<input type='checkbox' name='overwrite' autocomplete='off'></label>";

      const submit_result = this.submit_result = form.appendChild( document.createElement( "div" ) );
      submit_result.style         = "margin: 10px 0";

      const new_demo_code = this.new_demo_code = form.appendChild( document.createElement( "textarea" ) );
      new_demo_code.name    = "new_demo_code";
      new_demo_code.rows    = this.options.rows || 25;
      new_demo_code.cols    = 140;
      if( initially_selected_class )
        this.select_class( initially_selected_class );
    }
  select_class( class_definition )
    { this.new_demo_code.value = class_definition.toString(); }
  fetch_handler( url, body )          // A general utility function for sending / receiving JSON, with error handling.
    { return fetch( url,
      { body: body, method: body === undefined ? 'GET' : 'POST', 
        headers: { 'content-type': 'application/json'  } 
      }).then( response =>
      { if ( response.ok )  return Promise.resolve( response.json() )
        else                return Promise.reject ( response.status )
      })
    }
  submit_demo()
    { const form_fields = Array.from( this.form.elements ).reduce( ( accum, elem ) => 
        { if( elem.value && !( ['checkbox', 'radio'].includes( elem.type ) && !elem.checked ) )
            accum[ elem.name ] = elem.value; 
          return accum;
        }, {} );
        
      this.submit_result.innerHTML = "";
      return this.fetch_handler( "/submit-demo?Unapproved", JSON.stringify( form_fields ) )
        .then ( response => { if( response.show_password  ) this.password_box.style.display = "inline";
                              if( response.show_overwrite ) this.overwrite_panel.style.display = "inline";
                              this.submit_result.innerHTML += response.message + "<br>"; } )
        .catch(    error => { this.submit_result.innerHTML += "Error " + error + " when trying to upload.<br>" } )
    }
}


const Text_Widget = widgets.Text_Widget =
class Text_Widget
{                                                // **Text_Widget** generates HTML documentation and fills a panel with it.  This
                                                 // documentation is extracted from whichever Scene object gets loaded first.
  constructor( element, scenes, webgl_manager ) 
    { const rules = [ ".text-widget { background: white; width:1060px;\
                        padding:0 10px; overflow:auto; transition:1s; overflow-y:scroll; box-shadow: 10px 10px 90px 0 inset LightGray}",
                      ".text-widget div { transition:none } "
                    ];
      if( document.styleSheets.length == 0 ) document.head.appendChild( document.createElement( "style" ) );
      for( const r of rules ) document.styleSheets[document.styleSheets.length - 1].insertRule( r, 0 )

      Object.assign( this, { element, scenes, webgl_manager } );
      this.render();
    }
  render( time = 0 )
    { if( this.scenes[0] )
        this.scenes[0].show_explanation( this.element, this.webgl_manager )
      else
        this.event = window.requestAnimFrame( this.render.bind( this ) )
    }
}

/***/ }),

/***/ "./tiny-graphics.js":
/*!**************************!*\
  !*** ./tiny-graphics.js ***!
  \**************************/
/*! exports provided: tiny */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tiny", function() { return tiny; });
// tiny-graphics.js - A file that shows how to organize a complete graphics program.  It wraps common WebGL commands and math.
// The file tiny-graphics-widgets.js additionally wraps web page interactions.  By Garett.

                           // This file will consist of a number of class definitions that we will
                           // export.  To organize the exports, we will both declare each class in
                           // local scope (const) as well as store them in this JS object:
const tiny = {};

    // Organization of this file:  Math definitions, then graphics definitions.

    // Vector and Matrix algebra are not built into JavaScript at first.  We will add it now.

    // You will be able to declare a 3D vector [x,y,z] supporting various common vector operations 
    // with syntax:  vec(x,y), vec3( x,y,z ) or vec4( x,y,z, zero or one ).  For general sized vectors, use 
    // class Vector and declare them with standard Array-supported operations like .of().

    // For matrices, you will use class Mat4 to generate the 4 by 4 matrices that are common
    // in graphics, or for general sized matrices you can use class Matrix.

    // To get vector algebra that performs well in JavaScript, we based class Vector on consecutive 
    // buffers (using type Float32Array).  Implementations should specialize for common vector 
    // sizes 3 and 4 since JavaScript engines can better optimize functions when they can predict
    // argument count.  Implementations should also avoid allocating new array objects since these
    // will all have to be garbage collected.

      // Examples:
      
  //  ** For size 3 **   
  //     equals: "vec3( 1,0,0 ).equals( vec3( 1,0,0 ) )" returns true.
  //       plus: "vec3( 1,0,0 ).plus  ( vec3( 1,0,0 ) )" returns the Vector [ 2,0,0 ].
  //      minus: "vec3( 1,0,0 ).minus ( vec3( 1,0,0 ) )" returns the Vector [ 0,0,0 ].
  // mult-pairs: "vec3( 1,2,3 ).mult_pairs( vec3( 3,2,0 ) )" returns the Vector [ 3,4,0 ].
  //      scale: "vec3( 1,2,3 ).scale( 2 )" overwrites the Vector with [ 2,4,6 ].
  //      times: "vec3( 1,2,3 ).times( 2 )" returns the Vector [ 2,4,6 ].
  // randomized: Returns this Vector plus a random vector of a given maximum length.
  //        mix: "vec3( 0,2,4 ).mix( vec3( 10,10,10 ), .5 )" returns the Vector [ 5,6,7 ].
  //       norm: "vec3( 1,2,3 ).norm()" returns the square root of 15.
  // normalized: "vec3( 4,4,4 ).normalized()" returns the Vector [ sqrt(3), sqrt(3), sqrt(3) ]
  //  normalize: "vec3( 4,4,4 ).normalize()" overwrites the Vector with [ sqrt(3), sqrt(3), sqrt(3) ].
  //        dot: "vec3( 1,2,3 ).dot( vec3( 1,2,3 ) )" returns 15.
  //       cast: "vec3.cast( [-1,-1,0], [1,-1,0], [-1,1,0] )" converts a list of Array literals into a list of vec3's.
  //        to4: "vec3( 1,2,3 ).to4( true or false )" returns the homogeneous vec4 [ 1,2,3, 1 or 0 ].
  //      cross: "vec3( 1,0,0 ).cross( vec3( 0,1,0 ) )" returns the Vector [ 0,0,1 ].  Use only on 3x1 Vecs.
  //  to_string: "vec3( 1,2,3 ).to_string()" returns "[vec3 1, 2, 3]"
  //  ** For size 4, same except: **    
  //        to3: "vec4( 4,3,2,1 ).to3()" returns the vec3 [ 4,3,2 ].  Use to truncate vec4 to vec3.
  //  ** To assign by value **
  //       copy: "let new_vector = old_vector.copy()" assigns by value so you get a different vector object.
  //  ** For any size **
  // to declare: Vector.of( 1,2,3,4,5,6,7,8,9,10 ) returns a Vector filled with those ten entries.
  //  ** For multiplication by matrices **
  //             "any_mat4.times( vec4( 1,2,3,0 ) )" premultiplies the homogeneous Vector [1,2,3]
  //              by the 4x4 matrix and returns the new vec4.  Requires a vec4 as input.

const Vector = tiny.Vector =
class Vector extends Float32Array
{                                   // **Vector** stores vectors of floating point numbers.  Puts vector math into JavaScript.
                                    // Note:  Vectors should be created with of() due to wierdness with the TypedArray spec.
                                    // Tip: Assign Vectors with .copy() to avoid referring two variables to the same Vector object.
  static create( ...arr )
    { return new Vector( arr );
    }
  copy() 
    { return new Vector( this ) }
  equals( b ) 
    { return this.every( (x,i) => x == b[i] ) }
  plus( b )
    { return this.map(   (x,i) => x +  b[i] ) }
  minus( b )
    { return this.map(   (x,i) => x -  b[i] ) }
  times_pairwise( b )
    { return this.map(   (x,i) => x *  b[i] ) }
  scale_by( s )
    { this.forEach(  (x, i, a) => a[i] *= s ) }
  times( s )
    { return this.map(       x => s*x ) }
  randomized( s )
    { return this.map(       x => x + s*(Math.random()-.5) ) }
  mix( b, s ) 
    { return this.map(   (x,i) => (1-s)*x + s*b[i] ) }
  norm()
    { return Math.sqrt( this.dot( this ) ) }
  normalized()
    { return this.times( 1/this.norm() ) }
  normalize()
    {     this.scale_by( 1/this.norm() ) }
  dot(b)
    { if( this.length == 2 )                    // Optimize for Vectors of size 2
        return this[0]*b[0] + this[1]*b[1];  
      return this.reduce( ( acc, x, i ) => { return acc + x*b[i]; }, 0 );
    }              
  static cast( ...args )
                            // cast(): For compact syntax when declaring lists.      
    { return args.map( x => Vector.from(x) ) }
                // to3() / to4() / cross():  For standardizing the API with Vector3/Vector4, so
                // the performance hit of changing between these types can be measured.
  to3()
    { return vec3( this[0], this[1], this[2]              ); }
  to4( is_a_point )
    { return vec4( this[0], this[1], this[2], +is_a_point ); }
  cross(b)
    { return vec3( this[1]*b[2] - this[2]*b[1], this[2]*b[0] - this[0]*b[2], this[0]*b[1] - this[1]*b[0] ); }
  to_string() { return "[vector " + this.join( ", " ) + "]" }
}


const Vector3 = tiny.Vector3 =
class Vector3 extends Float32Array
{                                 // **Vector3** is a specialization of Vector only for size 3, for performance reasons.
  static create( x, y, z )
    { const v = new Vector3( 3 );
      v[0] = x; v[1] = y; v[2] = z;
      return v;
    }
  copy()
    { return Vector3.from( this ) }
                                              // In-fix operations: Use these for more readable math expressions.
  equals( b )
    { return this[0] == b[0] && this[1] == b[1] && this[2] == b[2] }
  plus( b )
    { return vec3( this[0]+b[0], this[1]+b[1], this[2]+b[2] ) }
  minus( b )
    { return vec3( this[0]-b[0], this[1]-b[1], this[2]-b[2] ) }
  times( s )
    { return vec3( this[0]*s,    this[1]*s,    this[2]*s    ) }
  times_pairwise( b )
    { return vec3( this[0]*b[0], this[1]*b[1], this[2]*b[2] ) }
                                            // Pre-fix operations: Use these for better performance (to avoid new allocation).  
  add_by( b )
    { this[0] += b[0];  this[1] += b[1];  this[2] += b[2] }
  subtract_by( b )
    { this[0] -= b[0];  this[1] -= b[1];  this[2] -= b[2] }
  scale_by( s )
    { this[0] *= s;  this[1] *= s;  this[2] *= s }
  scale_pairwise_by( b )
    { this[0] *= b[0];  this[1] *= b[1];  this[2] *= b[2] }
                                            // Other operations:  
  randomized( s )
    { return vec3( this[0]+s*(Math.random()-.5), 
                   this[1]+s*(Math.random()-.5),
                   this[2]+s*(Math.random()-.5) );
    }
  mix( b, s )
    { return vec3( (1-s)*this[0] + s*b[0],
                   (1-s)*this[1] + s*b[1],
                   (1-s)*this[2] + s*b[2] );
    }
  norm()
    { return Math.sqrt( this[0]*this[0] + this[1]*this[1] + this[2]*this[2] ) }
  normalized()
    { const d = 1/this.norm();
      return vec3( this[0]*d, this[1]*d, this[2]*d );
    }
  normalize()
    { const d = 1/this.norm();
      this[0] *= d;  this[1] *= d;  this[2] *= d; 
    }
  dot( b )
    { return this[0]*b[0] + this[1]*b[1] + this[2]*b[2] }
  cross( b )
    { return vec3( this[1]*b[2] - this[2]*b[1],
                   this[2]*b[0] - this[0]*b[2],
                   this[0]*b[1] - this[1]*b[0]  ) }
  static cast( ...args )
    {                             // cast(): Converts a bunch of arrays into a bunch of vec3's.
      return args.map( x => Vector3.from( x ) );
    }
  static unsafe( x,y,z )
    {                // unsafe(): returns vec3s only meant to be consumed immediately. Aliases into 
                     // shared memory, to be overwritten upon next unsafe3 call.  Faster.
      const shared_memory = vec3( 0,0,0 );
      Vector3.unsafe = ( x,y,z ) =>
        { shared_memory[0] = x;  shared_memory[1] = y;  shared_memory[2] = z;
          return shared_memory;
        }
      return Vector3.unsafe( x,y,z );
    }
  to4( is_a_point )
                    // to4():  Convert to a homogeneous vector of 4 values.
    { return vec4( this[0], this[1], this[2], +is_a_point ) }
  to_string()
    { return "[vec3 " + this.join( ", " ) + "]" }
}

const Vector4 = tiny.Vector4 =
class Vector4 extends Float32Array
{                                 // **Vector4** is a specialization of Vector only for size 4, for performance reasons.
                                  // The fourth coordinate value is homogenized (0 for a vector, 1 for a point).
  static create( x, y, z, w )
    { const v = new Vector4( 4 );
      v[0] = x; v[1] = y; v[2] = z; v[3] = w;
      return v;
    }
  copy()
    { return Vector4.from( this ) }
                                            // In-fix operations: Use these for more readable math expressions.
  equals()
    { return this[0] == b[0] && this[1] == b[1] && this[2] == b[2] && this[3] == b[3] }
  plus( b )
    { return vec4( this[0]+b[0], this[1]+b[1], this[2]+b[2], this[3]+b[3] ) }
  minus( b )
    { return vec4( this[0]-b[0], this[1]-b[1], this[2]-b[2], this[3]-b[3] ) }
  times( s )
    { return vec4( this[0]*s, this[1]*s, this[2]*s, this[3]*s ) }
  times_pairwise( b )
    { return vec4( this[0]*b[0], this[1]*b[1], this[2]*b[2], this[3]*b[3] ) }
                                            // Pre-fix operations: Use these for better performance (to avoid new allocation).  
  add_by( b )
    { this[0] += b[0];  this[1] += b[1];  this[2] += b[2];  this[3] += b[3] }
  subtract_by( b )
    { this[0] -= b[0];  this[1] -= b[1];  this[2] -= b[2];  this[3] -= b[3] }
  scale_by( s )
    { this[0] *= s;  this[1] *= s;  this[2] *= s;  this[3] *= s }
  scale_pairwise_by( b )
    { this[0] *= b[0];  this[1] *= b[1];  this[2] *= b[2];  this[3] *= b[3] }
                                            // Other operations:  
  randomized( s )
    { return vec4( this[0]+s*(Math.random()-.5), 
                   this[1]+s*(Math.random()-.5),
                   this[2]+s*(Math.random()-.5),
                   this[3]+s*(Math.random()-.5) );
    }
  mix( b, s )
    { return vec4( (1-s)*this[0] + s*b[0],
                   (1-s)*this[1] + s*b[1],
                   (1-s)*this[2] + s*b[2], 
                   (1-s)*this[3] + s*b[3] );
    }
                // The norms should behave like for Vector3 because of the homogenous format.
  norm()
    { return Math.sqrt( this[0]*this[0] + this[1]*this[1] + this[2]*this[2] ) }
  normalized()
    { const d = 1/this.norm();
      return vec4( this[0]*d, this[1]*d, this[2]*d, this[3] );    // (leaves the 4th coord alone)
    }
  normalize()
    { const d = 1/this.norm();
      this[0] *= d;  this[1] *= d;  this[2] *= d;                 // (leaves the 4th coord alone)
    }
  dot( b )
    { return this[0]*b[0] + this[1]*b[1] + this[2]*b[2] + this[3]*b[3] }
  static unsafe( x, y, z, w )
    {                // **unsafe** Returns vec3s to be used immediately only. Aliases into 
                     // shared memory to be overwritten on next unsafe3 call.  Faster.
      const shared_memory = vec4( 0,0,0,0 );
      Vec4.unsafe = ( x,y,z,w ) =>
        { shared_memory[0] = x;  shared_memory[1] = y;
          shared_memory[2] = z;  shared_memory[3] = w; }
    }
  to3()
    { return vec3( this[0], this[1], this[2] ) }
  to_string()
    { return "[vec4 " + this.join( ", " ) + "]" }
}

const vec     = tiny.vec     = Vector .create;
const vec3    = tiny.vec3    = Vector3.create;
const vec4    = tiny.vec4    = Vector4.create;
const unsafe3 = tiny.unsafe3 = Vector3.unsafe;
const unsafe4 = tiny.unsafe4 = Vector4.unsafe;

      // **Color** is just an alias for class Vector4.  Colors should be made as special 4x1
      // vectors expressed as ( red, green, blue, opacity ) each ranging from 0 to 1.
const color = tiny.color = Vector4.create;

const Matrix = tiny.Matrix =
class Matrix extends Array                         
{                                   // **Matrix** holds M by N matrices of floats.  Enables matrix and vector math.
  // Example usage:
  //  "Matrix( rows )" returns a Matrix with those rows, where rows is an array of float arrays.
  //  "M.set_identity( m, n )" assigns the m by n identity to Matrix M.
  //  "M.sub_block( start, end )" where start and end are each a [ row, column ] pair returns a sub-rectangle cut out from M.
  //  "M.copy()" creates a deep copy of M and returns it so you can modify it without affecting the original.
  //  "M.equals(b)", "M.plus(b)", and "M.minus(b)" are operations betwen two matrices.
  //  "M.transposed()" returns a new matrix where all rows of M became columns and vice versa.
  //  "M.times(b)" (where the post-multiplied b can be a scalar, a Vector4, or another Matrix) returns a 
  //               new Matrix or Vector4 holding the product.
  //  "M.pre_multiply(b)"  overwrites the Matrix M with the product of b * M where b must be another Matrix.
  //  "M.post_multiply(b)" overwrites the Matrix M with the product of M * b where b can be a Matrix or scalar.
  //  "Matrix.flatten_2D_to_1D( M )" flattens input (a Matrix or any array of Vectors or float arrays)
  //                                 into a row-major 1D array of raw floats.
  //  "M.to_string()" where M contains the 4x4 identity returns "[[1, 0, 0, 0] [0, 1, 0, 0] [0, 0, 1, 0] [0, 0, 0, 1]]".

  constructor( ...args )
    { super(0);
      this.push( ...args )
    }
  set( M )
    { this.length = 0; 
      this.push( ...M );
    }
  set_identity ( m, n )
    { this.length = 0; 
      for( let i = 0; i < m; i++ ) 
      { this.push( Array(n).fill(0) ); 
        if( i < n ) this[i][i] = 1; 
      }
    }
  sub_block( start, end )  { return Matrix.from( this.slice( start[0], end[0] ).map( r => r.slice( start[1], end[1] ) ) ); }
  copy      () { return this.map(      r  => [ ...r ]                  ) }
  equals   (b) { return this.every( (r,i) => r.every( (x,j) => x == b[i][j] ) ) }
  plus     (b) { return this.map(   (r,i) => r.map  ( (x,j) => x +  b[i][j] ) ) }
  minus    (b) { return this.map(   (r,i) => r.map  ( (x,j) => x -  b[i][j] ) ) }
  transposed() { return this.map(   (r,i) => r.map  ( (x,j) =>   this[j][i] ) ) }
  times    (b, optional_preallocated_result)                                                                       
    { const len = b.length;
      if( typeof len  === "undefined" ) return this.map( r => r.map( x => b*x ) );   // Matrix * scalar case.
      const len2 = b[0].length;    
      if( typeof len2 === "undefined" )
      { let result = optional_preallocated_result || new Vector4( this.length );     // Matrix * Vector4 case.
        for( let r=0; r < len; r++ ) result[r] = b.dot(this[r]);                      
        return result;
      }
      let result = optional_preallocated_result || Matrix.from( new Array( this.length ) );
      for( let r = 0; r < this.length; r++ )                                         // Matrix * Matrix case.
      { if( !optional_preallocated_result )
          result[ r ] = new Array( len2 );
        for( let c = 0, sum = 0; c < len2; c++ )
        { result[ r ][ c ] = 0;
          for( let r2 = 0; r2 < len; r2++ )
            result[ r ][ c ] += this[ r ][ r2 ] * b[ r2 ][ c ];
        }
      }
      return result;
    }
  pre_multiply (b) { const new_value = b.times( this ); this.length = 0; this.push( ...new_value ); return this; }
  post_multiply(b) { const new_value = this.times( b ); this.length = 0; this.push( ...new_value ); return this; }
  static flatten_2D_to_1D( M )
    { let index = 0, floats = new Float32Array( M.length && M.length * M[0].length );
      for( let i = 0; i < M.length; i++ ) for( let j = 0; j < M[i].length; j++ ) floats[ index++ ] = M[i][j];
      return floats;
    }
  to_string() { return "[" + this.map( (r,i) => "[" + r.join(", ") + "]" ).join(" ") + "]" }
}


const Mat4 = tiny.Mat4 =
class Mat4 extends Matrix
{                                                   // **Mat4** generates special 4x4 matrices that are useful for graphics.
                                                    // All the methods below return a certain 4x4 matrix.
  static identity()
    { return Matrix.of( [ 1,0,0,0 ], [ 0,1,0,0 ], [ 0,0,1,0 ], [ 0,0,0,1 ] ); };
  static rotation( angle, x,y,z )
    {                                               // rotation(): Requires a scalar (angle) and a three-component axis vector.
      const normalize = ( x,y,z ) =>
        { const n = Math.sqrt( x*x + y*y + z*z );
          return [ x/n, y/n, z/n ]
        }
      let [ i, j, k ] = normalize( x,y,z ), 
             [ c, s ] = [ Math.cos( angle ), Math.sin( angle ) ],
                  omc = 1.0 - c;
      return Matrix.of( [ i*i*omc + c,   i*j*omc - k*s, i*k*omc + j*s, 0 ],
                        [ i*j*omc + k*s, j*j*omc + c,   j*k*omc - i*s, 0 ],
                        [ i*k*omc - j*s, j*k*omc + i*s, k*k*omc + c,   0 ],
                        [ 0,             0,             0,             1 ] );
    }
  static scale( x,y,z )
    {                                               // scale(): Builds and returns a scale matrix using x,y,z.
      return Matrix.of( [ x, 0, 0, 0 ],
                        [ 0, y, 0, 0 ],
                        [ 0, 0, z, 0 ],
                        [ 0, 0, 0, 1 ] );
    }
  static translation( x,y,z ) 
    {                                               // translation(): Builds and returns a translation matrix using x,y,z.
      return Matrix.of( [ 1, 0, 0, x ],
                        [ 0, 1, 0, y ],
                        [ 0, 0, 1, z ],
                        [ 0, 0, 0, 1 ] );
    }
  static look_at( eye, at, up )                      
    {                                   // look_at():  Produce a traditional graphics camera "lookat" matrix.
                                        // Each input must be a 3x1 Vector.
                                        // Note:  look_at() assumes the result will be used for a camera and stores its
                                        // result in inverse space.  
                                        // If you want to use look_at to point a non-camera towards something, you can
                                        // do so, but to generate the correct basis you must re-invert its result.
  
          // Compute vectors along the requested coordinate axes. "y" is the "updated" and orthogonalized local y axis.
      let z = at.minus( eye ).normalized(),
          x =  z.cross( up  ).normalized(),
          y =  x.cross( z   ).normalized();
          
                             // Check for NaN, indicating a degenerate cross product, which 
                             // happens if eye == at, or if at minus eye is parallel to up.
      if( !x.every( i => i==i ) )                  
        throw "Two parallel vectors were given";
      z.scale_by( -1 );                               // Enforce right-handed coordinate system.                                   
      return Mat4.translation( -x.dot( eye ), -y.dot( eye ), -z.dot( eye ) )
             .times( Matrix.of( x.to4(0), y.to4(0), z.to4(0), vec4( 0,0,0,1 ) ) );
    }
  static orthographic( left, right, bottom, top, near, far )
    {                                                          // orthographic(): Box-shaped view volume for projection.
      return    Mat4.scale( vec3( 1/(right - left), 1/(top - bottom), 1/(far - near) ) )
        .times( Mat4.translation( vec3( -left - right, -top - bottom, -near - far ) ) )
        .times( Mat4.scale( vec3( 2, 2, -2 ) ) );
    }
  static perspective( fov_y, aspect, near, far )
    {                                                         // perspective(): Frustum-shaped view volume for projection.
      const f = 1/Math.tan( fov_y/2 ), d = far - near;
      return Matrix.of( [ f/aspect, 0,               0,               0 ],
                        [ 0,        f,               0,               0 ],
                        [ 0,        0, -(near+far) / d, -2*near*far / d ],
                        [ 0,        0,              -1,               0 ] );
    }
  static inverse( m )              
    {                         // inverse(): A 4x4 inverse.  Computing it is slow because of 
                              // the amount of steps; call fewer times when possible.
      const result = Mat4.identity(), m00 = m[0][0], m01 = m[0][1], m02 = m[0][2], m03 = m[0][3],
                                      m10 = m[1][0], m11 = m[1][1], m12 = m[1][2], m13 = m[1][3],
                                      m20 = m[2][0], m21 = m[2][1], m22 = m[2][2], m23 = m[2][3],
                                      m30 = m[3][0], m31 = m[3][1], m32 = m[3][2], m33 = m[3][3];
      result[ 0 ][ 0 ] = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;
      result[ 0 ][ 1 ] = m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 + m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33;
      result[ 0 ][ 2 ] = m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 - m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33;
      result[ 0 ][ 3 ] = m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 + m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23;
      result[ 1 ][ 0 ] = m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 + m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33;
      result[ 1 ][ 1 ] = m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 - m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33;
      result[ 1 ][ 2 ] = m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 + m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33;
      result[ 1 ][ 3 ] = m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 - m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23;
      result[ 2 ][ 0 ] = m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 - m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33;
      result[ 2 ][ 1 ] = m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 + m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33;
      result[ 2 ][ 2 ] = m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 - m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33;
      result[ 2 ][ 3 ] = m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 + m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23;
      result[ 3 ][ 0 ] = m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 + m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32;
      result[ 3 ][ 1 ] = m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 - m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32;
      result[ 3 ][ 2 ] = m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 + m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32;
      result[ 3 ][ 3 ] = m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22;
                                                                                               // Divide by determinant and return.
      return result.times( 1/( m00*result[0][0] + m10*result[0][1] + m20*result[0][2] + m30*result[0][3] ) );
    }
}


const Keyboard_Manager = tiny.Keyboard_Manager =
class Keyboard_Manager     
{                        // **Keyboard_Manager** maintains a running list of which keys are depressed.  You can map combinations of
                         // shortcut keys to trigger callbacks you provide by calling add().  See add()'s arguments.  The shortcut 
                         // list is indexed by convenient strings showing each bound shortcut combination.  The constructor 
                         // optionally takes "target", which is the desired DOM element for keys to be pressed inside of, and
                         // "callback_behavior", which will be called for every key action and allows extra behavior on each event
                         // -- giving an opportunity to customize their bubbling, preventDefault, and more.  It defaults to no
                         // additional behavior besides the callback itself on each assigned key action.
  constructor( target = document, callback_behavior = ( callback, event ) => callback( event ) )
    { this.saved_controls = {};     
      this.actively_pressed_keys = new Set();
      this.callback_behavior = callback_behavior;
      target.addEventListener( "keydown",     this.key_down_handler.bind( this ) );
      target.addEventListener( "keyup",       this.  key_up_handler.bind( this ) );
      window.addEventListener( "focus", () => this.actively_pressed_keys.clear() );  // Deal with stuck keys during focus change.
    }
  key_down_handler( event )
    { if( [ "INPUT", "TEXTAREA" ].includes( event.target.tagName ) ) return;    // Don't interfere with typing.
      this.actively_pressed_keys.add( event.key );                              // Track the pressed key.
      for( let saved of Object.values( this.saved_controls ) )                  // Re-check all the keydown handlers.
      { if( saved.shortcut_combination.every( s => this.actively_pressed_keys.has( s ) )
          && event. ctrlKey   == saved.shortcut_combination.includes( "Control" )
          && event.shiftKey   == saved.shortcut_combination.includes( "Shift" )
          && event.  altKey   == saved.shortcut_combination.includes( "Alt" )
          && event. metaKey   == saved.shortcut_combination.includes( "Meta" ) )  // Modifiers must exactly match.
            this.callback_behavior( saved.callback, event );                      // The keys match, so fire the callback.
      }
    }
  key_up_handler( event )
    { const lower_symbols = "qwertyuiopasdfghjklzxcvbnm1234567890-=[]\\;',./",
            upper_symbols = "QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*()_+{}|:\"<>?";

      const lifted_key_symbols = [ event.key, upper_symbols[ lower_symbols.indexOf( event.key ) ],
                                              lower_symbols[ upper_symbols.indexOf( event.key ) ] ];
                                                                                        // Call keyup for any shortcuts 
      for( let saved of Object.values( this.saved_controls ) )                          // that depended on the released
        if( lifted_key_symbols.some( s => saved.shortcut_combination.includes( s ) ) )  // key or its shift-key counterparts.
          this.callback_behavior( saved.keyup_callback, event );                  // The keys match, so fire the callback.
      lifted_key_symbols.forEach( k => this.actively_pressed_keys.delete( k ) );
    }
  add( shortcut_combination, callback = () => {}, keyup_callback = () => {} )
    {                                 // add(): Creates a keyboard operation.  The argument shortcut_combination wants an 
                                      // array of strings that follow standard KeyboardEvent key names. Both the keyup
                                      // and keydown callbacks for any key combo are optional.
      this.saved_controls[ shortcut_combination.join('+') ] = { shortcut_combination, callback, keyup_callback };
    }
}


const Graphics_Card_Object = tiny.Graphics_Card_Object =
class Graphics_Card_Object       
{                                       // ** Graphics_Card_Object** Extending this base class allows an object to
                                        // copy itself onto a WebGL context on demand, whenever it is first used for
                                        // a GPU draw command on a context it hasn't seen before.
  constructor() 
    { this.gpu_instances = new Map() }     // Track which GPU contexts this object has copied itself onto.
  copy_onto_graphics_card( context, intial_gpu_representation )
    {                           // copy_onto_graphics_card():  Our object might need to register to multiple 
                                // GPU contexts in the case of multiple drawing areas.  If this is a new GPU
                                // context for this object, copy the object to the GPU.  Otherwise, this 
                                // object already has been copied over, so get a pointer to the existing 
                                // instance.  The instance consists of whatever GPU pointers are associated
                                // with this object, as returned by the WebGL calls that copied it to the 
                                // GPU.  GPU-bound objects should override this function, which builds an 
                                // initial instance, so as to populate it with finished pointers. 
      const existing_instance = this.gpu_instances.get( context );

                                // Warn the user if they are avoidably making too many GPU objects.  Beginner
                                // WebGL programs typically only need to call copy_onto_graphics_card once 
                                // per object; doing it more is expensive, so warn them with an "idiot 
                                // alarm". Don't trigger the idiot alarm if the user is correctly re-using
                                // an existing GPU context and merely overwriting parts of itself.
      if( !existing_instance )
        { Graphics_Card_Object.idiot_alarm |= 0;     // Start a program-wide counter.
          if( Graphics_Card_Object.idiot_alarm++ > 200 )
            throw `Error: You are sending a lot of object definitions to the GPU, probably by mistake!  Many of them are likely duplicates, which you
                   don't want since sending each one is very slow.  To avoid this, from your display() function avoid ever declaring a Shape Shader
                   or Texture (or subclass of these) with "new", thus causing the definition to be re-created and re-transmitted every frame.  
                   Instead, call these in your scene's constructor and keep the result as a class member, or otherwise make sure it only happens 
                   once.  In the off chance that you have a somehow deformable shape that MUST change every frame, then at least use the special
                   arguments of copy_onto_graphics_card to limit which buffers get overwritten every frame to only the necessary ones.`;
        }
                                                // Check if this object already exists on that GPU context.
      return existing_instance ||             // If necessary, start a new object associated with the context.
             this.gpu_instances.set( context, intial_gpu_representation ).get( context );
    }
  activate( context, ...args )
    {                            // activate():  To use, super call it to retrieve a container of GPU 
                                 // pointers associated with this object.  If none existed one will be created.  
                                 // Then do any WebGL calls you need that require GPU pointers.
      return this.gpu_instances.get( context ) || this.copy_onto_graphics_card( context, ...args )
    }
}


const Vertex_Buffer = tiny.Vertex_Buffer =
class Vertex_Buffer extends Graphics_Card_Object
{                       // **Vertex_Buffer** organizes data related to one 3D shape and copies it into GPU memory.  That data
                        // is broken down per vertex in the shape.  To use, make a subclass of it that overrides the 
                        // constructor and fills in the "arrays" property.  Within "arrays", you can make several fields that 
                        // you can look up in a vertex; for each field, a whole array will be made here of that data type and 
                        // it will be indexed per vertex.  Along with those lists is an additional array "indices" describing
                        // how vertices are connected to each other into shape primitives.  Primitives could includes
                        // triangles, expressed as triples of vertex indices.
  constructor( ...array_names )
    {                             // This superclass constructor expects a list of names of arrays that you plan for.
      super();
      [ this.arrays, this.indices ] = [ {}, [] ];
                                  // Initialize a blank array member of the Shape with each of the names provided:
      for( let name of array_names ) this.arrays[ name ] = [];
    }
  copy_onto_graphics_card( context, selection_of_arrays = Object.keys( this.arrays ), write_to_indices = true )
    {           // copy_onto_graphics_card():  Called automatically as needed to load this vertex array set onto 
                // one of your GPU contexts for its first time.  Send the completed vertex and index lists to 
                // their own buffers within any of your existing graphics card contexts.  Optional arguments 
                // allow calling this again to overwrite the GPU buffers related to this shape's arrays, or 
                // subsets of them as needed (if only some fields of your shape have changed).

                // Define what this object should store in each new WebGL Context:
      const initial_gpu_representation = { webGL_buffer_pointers: {} };
                                // Our object might need to register to multiple GPU contexts in the case of 
                                // multiple drawing areas.  If this is a new GPU context for this object, 
                                // copy the object to the GPU.  Otherwise, this object already has been 
                                // copied over, so get a pointer to the existing instance.
      const did_exist = this.gpu_instances.get( context );
      const gpu_instance = super.copy_onto_graphics_card( context, initial_gpu_representation );

      const gl = context;

      const write = did_exist ? ( target, data ) => gl.bufferSubData( target, 0, data )
                              : ( target, data ) => gl.bufferData( target, data, gl.STATIC_DRAW );

      for( let name of selection_of_arrays )
        { if( !did_exist )
            gpu_instance.webGL_buffer_pointers[ name ] = gl.createBuffer();
          gl.bindBuffer( gl.ARRAY_BUFFER, gpu_instance.webGL_buffer_pointers[ name ] );
          write( gl.ARRAY_BUFFER, Matrix.flatten_2D_to_1D( this.arrays[ name ] ) );
        }
      if( this.indices.length && write_to_indices )
        { if( !did_exist )
            gpu_instance.index_buffer = gl.createBuffer();
          gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gpu_instance.index_buffer );
          write( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array( this.indices ) );
        }
      return gpu_instance;
    }
  execute_shaders( gl, gpu_instance, type )     // execute_shaders(): Draws this shape's entire vertex buffer.
    {       // Draw shapes using indices if they exist.  Otherwise, assume the vertices are arranged as triples.
      if( this.indices.length )
      { gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gpu_instance.index_buffer );
        gl.drawElements( gl[type], this.indices.length, gl.UNSIGNED_INT, 0 ) 
      }
      else  gl.drawArrays( gl[type], 0, Object.values( this.arrays )[0].length );
    }
  draw( webgl_manager, program_state, model_transform, material, type = "TRIANGLES" )
    {                                       // draw():  To appear onscreen, a shape of any variety goes through this function,
                                            // which executes the shader programs.  The shaders draw the right shape due to
                                            // pre-selecting the correct buffer region in the GPU that holds that shape's data.
      const gpu_instance = this.activate( webgl_manager.context );
      material.shader.activate( webgl_manager.context, gpu_instance.webGL_buffer_pointers, program_state, model_transform, material );
                                                              // Run the shaders to draw every triangle now:
      this.execute_shaders( webgl_manager.context, gpu_instance, type );
    }
}


const Shape = tiny.Shape =
class Shape extends Vertex_Buffer
{           // **Shape** extends Vertex_Buffer to give it an awareness that it holds data about 3D space.  This class
            // is used the same way as Vertex_Buffer, by subclassing it and writing a constructor that fills in the
            // "arrays" property with some custom arrays.

            // Shape extends Vertex_Buffer's functionality for copying shapes into buffers the graphics card's memory,
            // adding the basic assumption that each vertex will have a 3D position and a 3D normal vector as available 
            // fields to look up.  This means there will be at least two arrays for the user to fill in:  "positions" 
            // enumerating all the vertices' locations, and "normals" enumerating all vertices' normal vectors pointing 
            // away from the surface.  Both are of type Vector3.

            // By including  these, Shape adds to class Vertex_Buffer the ability to compound shapes in together into a 
            // single performance-friendly Vertex_Buffer, placing this shape into a larger one at a custom transforms by
            // adjusting positions and normals with a call to insert_transformed_copy_into().  Compared to Vertex_Buffer
            // we also gain the ability via flat-shading to compute normals from scratch for a shape that has none, and 
            // the ability to eliminate inter-triangle sharing of vertices for any data we want to abruptly vary as we 
            // cross over a triangle edge (such as texture images).
            
            // Like in class Vertex_Buffer we have an array "indices" to fill in as well, a list of index triples
            // defining which three vertices belong to each triangle.  Call new on a Shape and fill its arrays (probably
            // in an overridden constructor).

            // IMPORTANT: To use this class you must define all fields for every single vertex by filling in the arrays
            // of each field, so this includes positions, normals, any more fields a specific Shape subclass decides to 
            // include per vertex, such as texture coordinates.  Be warned that leaving any empty elements in the lists 
            // will result in an out of bounds GPU warning (and nothing drawn) whenever the "indices" list contains
            // references to that position in the lists.
  static insert_transformed_copy_into( recipient, args, points_transform = Mat4.identity() )
    {               // insert_transformed_copy_into():  For building compound shapes.  A copy of this shape is made
                    // and inserted into any recipient shape you pass in.  Compound shapes help reduce draw calls
                    // and speed up performane.

                      // Here if you try to bypass making a temporary shape and instead directly insert new data into
                      // the recipient, you'll run into trouble when the recursion tree stops at different depths.
      const temp_shape = new this( ...args );
      recipient.indices.push( ...temp_shape.indices.map( i => i + recipient.arrays.position.length ) );
                                              // Copy each array from temp_shape into the recipient shape:
      for( let a in temp_shape.arrays )
      {                                 // Apply points_transform to all points added during this call:
        if( a == "position" || a == "tangents" )
          recipient.arrays[a].push( ...temp_shape.arrays[a].map( p => points_transform.times( p.to4(1) ).to3() ) );
                                        // Do the same for normals, but use the inverse transpose matrix as math requires:
        else if( a == "normal" )
          recipient.arrays[a].push( ...temp_shape.arrays[a].map( n => 
                                         Mat4.inverse( points_transform.transposed() ).times( n.to4(1) ).to3() ) );
                                        // All other arrays get copied in unmodified:
        else recipient.arrays[a].push( ...temp_shape.arrays[a] );
      }
    }
  make_flat_shaded_version()
    {                                     // make_flat_shaded_version(): Auto-generate a new class that re-uses any
                                          // Shape's points, but with new normals generated from flat shading.
      return class extends this.constructor
      { constructor( ...args )
          { super( ...args );  this.duplicate_the_shared_vertices();  this.flat_shade(); }        
      }
    }
  duplicate_the_shared_vertices()
    {                   // (Internal helper function)
                        //  Prepare an indexed shape for flat shading if it is not ready -- that is, if there are any
                        // edges where the same vertices are indexed by both the adjacent triangles, and those two 
                        // triangles are not co-planar.  The two would therefore fight over assigning different normal 
                        // vectors to the shared vertices.
      const arrays = {};
      for( let arr in this.arrays ) arrays[ arr ] = [];
      for( let index of this.indices )
        for( let arr in this.arrays )
          arrays[ arr ].push( this.arrays[ arr ][ index ] );      // Make re-arranged versions of each data field, with
      Object.assign( this.arrays, arrays );                       // copied values every time an index was formerly re-used.
      this.indices = this.indices.map( (x,i) => i );    // Without shared vertices, we can use sequential numbering.
    }
  flat_shade()           
    {                    // (Internal helper function)
                         // Automatically assign the correct normals to each triangular element to achieve flat shading.
                         // Affect all recently added triangles (those past "offset" in the list).  Assumes that no
                         // vertices are shared across seams.   First, iterate through the index or position triples:
      for( let counter = 0; counter < (this.indices ? this.indices.length : this.arrays.position.length); counter += 3 )
      { const indices = this.indices.length ? [ this.indices[ counter ], this.indices[ counter + 1 ], this.indices[ counter + 2 ] ]
                                            : [ counter, counter + 1, counter + 2 ];
        const [ p1, p2, p3 ] = indices.map( i => this.arrays.position[ i ] );
                                        // Cross the two edge vectors of this triangle together to get its normal:
        const n1 = p1.minus(p2).cross( p3.minus(p1) ).normalized();  
                                        // Flip the normal if adding it to the triangle brings it closer to the origin:
        if( n1.times(.1).plus(p1).norm() < p1.norm() ) n1.scale_by(-1);
                                        // Propagate this normal to the 3 vertices:
        for( let i of indices ) this.arrays.normal[ i ] = Vector3.from( n1 );
      }
    }
  normalize_positions( keep_aspect_ratios = true )
    { let p_arr = this.arrays.position;
      const average_position = p_arr.reduce( (acc,p) => acc.plus( p.times( 1/p_arr.length ) ), vec3( 0,0,0 ) );
      p_arr = p_arr.map( p => p.minus( average_position ) );           // Center the point cloud on the origin.
      const average_lengths  = p_arr.reduce( (acc,p) => 
                                         acc.plus( p.map( x => Math.abs(x) ).times( 1/p_arr.length ) ), vec3( 0,0,0 ) );
      if( keep_aspect_ratios )                            // Divide each axis by its average distance from the origin.
        this.arrays.position = p_arr.map( p => p.map( (x,i) => x/average_lengths[i] ) );
      else
        this.arrays.position = p_arr.map( p => p.times( 1/average_lengths.norm() ) );
    }
}


const Light = tiny.Light =
class Light
{                         // **Light** stores the properties of one light in a scene.  Contains a coordinate and a
                          // color (each are 4x1 Vectors) as well as one size scalar.
                          // The coordinate is homogeneous, and so is either a point or a vector.  Use w=0 for a
                          // vector (directional) light, and w=1 for a point light / spotlight.
                          // For spotlights, a light also needs a "size" factor for how quickly the brightness
                          // should attenuate (reduce) as distance from the spotlight increases.
  constructor( position, color, size ) { Object.assign( this, { position, color, attenuation: 1/size } ); }
}


const Graphics_Addresses = tiny.Graphics_Addresses =
class Graphics_Addresses
{                           // **Graphics_Addresses** is used internally in Shaders for organizing communication with the GPU.
                            // Once we've compiled the Shader, we can query some things about the compiled program, such as 
                            // the memory addresses it will use for uniform variables, and the types and indices of its per-
                            // vertex attributes.  We'll need those for building vertex buffers.
  constructor( program, gl )
  { const num_uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < num_uniforms; ++i)
      {                 // Retrieve the GPU addresses of each uniform variable in the shader
                        // based on their names, and store these pointers for later.
        let u = gl.getActiveUniform(program, i).name.split('[')[0];
        this[ u ] = gl.getUniformLocation( program, u ); 
      }
    
    this.shader_attributes = {};
                                                      // Assume per-vertex attributes will each be a set of 1 to 4 floats:
    const type_to_size_mapping = { 0x1406: 1, 0x8B50: 2, 0x8B51: 3, 0x8B52: 4 };
    const numAttribs = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES ); 
    for ( let i = 0; i < numAttribs; i++ )
    {                              // https://github.com/greggman/twgl.js/blob/master/dist/twgl-full.js for another example:
      const attribInfo = gl.getActiveAttrib( program, i );
                                                      // Pointers to all shader attribute variables:
      this.shader_attributes[ attribInfo.name ] = { index: gl.getAttribLocation( program, attribInfo.name ),
                                                    size: type_to_size_mapping[ attribInfo.type ],
                                                    enabled: true, type: gl.FLOAT,
                                                    normalized: false, stride: 0, pointer: 0 };
    }
  }
}


const Container = tiny.Container =
class Container
{                   // **Container** allows a way to create patch JavaScript objects within a single line.  Some properties get
                    // replaced with substitutes that you provide, without having to write out a new object from scratch.
                    // To override, simply pass in "replacement", a JS Object of keys/values you want to override, to generate 
                    // a new object.  For shorthand you can leave off the key and only provide a value (pass in directly as 
                    // "replacement") and a guess will be used for which member you want overridden based on type.  
  override( replacement )                     // override(): Generate a copy by value, replacing certain properties.
    { return this.helper( replacement, Object.create( this.constructor.prototype ) ) }
  replace(  replacement )                     // replace(): Like override, but modifies the original object.
    { return this.helper( replacement, this ) }
  helper( replacement, target )               // (Internal helper function)
    { Object.assign( target, this );
      if( replacement.constructor === Object )             // If a JS object was given, use its entries to override:
        return Object.assign( target, replacement );      
                                                           // Otherwise we'll try to guess the key to override by type:
      const matching_keys_by_type = Object.entries( this ).filter( ([key, value]) => replacement instanceof value.constructor );
      if( !matching_keys_by_type[0] ) throw "Container: Can't figure out which value you're trying to replace; nothing matched by type.";
      return Object.assign( target, { [ matching_keys_by_type[0][0] ]: replacement } );
    }
}


const Material = tiny.Material =
class Material extends Container
{                                       // **Material** contains messages for a shader program.  These configure the shader
                                        // for the particular color and style of one shape being drawn.  A material consists
                                        // of a pointer to the particular Shader it uses (to select that Shader for the draw
                                        // command), as well as a collection of any options wanted by the shader.
  constructor( shader, options )
  { super();
    Object.assign( this, { shader }, options );
  }
}


const Shader = tiny.Shader =
class Shader extends Graphics_Card_Object
{                           // **Shader** loads a GLSL shader program onto your graphics card, starting from a JavaScript string.
                            // To use it, make subclasses of Shader that define these strings of GLSL code.  The base class will
                            // command the GPU to recieve, compile, and run these programs.  In WebGL 1, the shader runs once per
                            // every shape that is drawn onscreen.

                            // Extend the class and fill in the abstract functions, some of which define GLSL strings, and others
                            // (update_GPU) which define the extra custom JavaScript code needed to populate your particular shader
                            // program with all the data values it is expecting, such as matrices.  The shader pulls these values
                            // from two places in your JavaScript:  A Material object, for values pertaining to the current shape
                            // only, and a Program_State object, for values pertaining to your entire Scene or program.
  copy_onto_graphics_card( context )
    {                                     // copy_onto_graphics_card():  Called automatically as needed to load the 
                                          // shader program onto one of your GPU contexts for its first time.

                // Define what this object should store in each new WebGL Context:
      const initial_gpu_representation = { program: undefined, gpu_addresses: undefined,
                                          vertShdr: undefined,      fragShdr: undefined };
                                // Our object might need to register to multiple GPU contexts in the case of 
                                // multiple drawing areas.  If this is a new GPU context for this object, 
                                // copy the object to the GPU.  Otherwise, this object already has been 
                                // copied over, so get a pointer to the existing instance.
      const gpu_instance = super.copy_onto_graphics_card( context, initial_gpu_representation );
      
      const gl = context;
      const program  = gpu_instance.program  || context.createProgram();
      const vertShdr = gpu_instance.vertShdr || gl.createShader( gl.VERTEX_SHADER );
      const fragShdr = gpu_instance.fragShdr || gl.createShader( gl.FRAGMENT_SHADER );
      
      if( gpu_instance.vertShdr ) gl.detachShader( program, vertShdr );
      if( gpu_instance.fragShdr ) gl.detachShader( program, fragShdr );

      gl.shaderSource( vertShdr, this.vertex_glsl_code() );
      gl.compileShader( vertShdr );
      if( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) )
        throw "Vertex shader compile error: "   + gl.getShaderInfoLog( vertShdr );

      gl.shaderSource( fragShdr, this.fragment_glsl_code() );
      gl.compileShader( fragShdr );
      if( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) )
        throw "Fragment shader compile error: " + gl.getShaderInfoLog( fragShdr );

      gl.attachShader( program, vertShdr );
      gl.attachShader( program, fragShdr );
      gl.linkProgram(  program );
      if( !gl.getProgramParameter( program, gl.LINK_STATUS) )
        throw "Shader linker error: "           + gl.getProgramInfoLog( this.program );

      Object.assign( gpu_instance, { program, vertShdr, fragShdr, gpu_addresses: new Graphics_Addresses( program, gl ) } );
      return gpu_instance;
    }
  activate( context, buffer_pointers, program_state, model_transform, material )
    {                                     // activate(): Selects this Shader in GPU memory so the next shape draws using it.        
    const gpu_instance = super.activate( context );

      context.useProgram( gpu_instance.program );

          // --- Send over all the values needed by this particular shader to the GPU: ---
      this.update_GPU( context, gpu_instance.gpu_addresses, program_state, model_transform, material );
      
          // --- Turn on all the correct attributes and make sure they're pointing to the correct ranges in GPU memory. ---
      for( let [ attr_name, attribute ] of Object.entries( gpu_instance.gpu_addresses.shader_attributes ) )
      { if( !attribute.enabled )
          { if( attribute.index >= 0 ) context.disableVertexAttribArray( attribute.index );
            continue;
          }
        context.enableVertexAttribArray( attribute.index );
        context.bindBuffer( context.ARRAY_BUFFER, buffer_pointers[ attr_name ] );    // Activate the correct buffer.
        context.vertexAttribPointer( attribute.index, attribute.size,   attribute.type,            // Populate each attribute 
                                attribute.normalized, attribute.stride, attribute.pointer );       // from the active buffer.
      }
    }                           // Your custom Shader has to override the following functions:    
  vertex_glsl_code(){}
  fragment_glsl_code(){}
  update_GPU(){}

        // *** How those four functions work (and how GPU shader programs work in general):
          
                             // vertex_glsl_code() and fragment_glsl_code() should each return strings that contain
                             // code for a custom vertex shader and fragment shader, respectively.

                             // The "Vertex Shader" is code that is sent to the graphics card at runtime, where on each 
                             // run it gets compiled and linked there.  Thereafter, all of your calls to draw shapes will 
                             // launch the vertex shader program, which runs every line of its code upon every vertex
                             // stored in your buffer simultaneously (each instruction executes on every array index at
                             // once).  Any GLSL "attribute" variables will appear to refer to some data field of just
                             // one vertex, but really they affect all the stored vertices at once in parallel.

                             // The purpose of this vertex shader program is to calculate the final resting place of 
                             // vertices in screen coordinates.  Each vertex starts out in local object coordinates 
                             // and then undergoes a matrix transform to land somewhere onscreen, or else misses the
                             // drawing area and is clipped (cancelled).  One this has program has executed on your whole 
                             // set of vertices, groups of them (three if using triangles) are connected together into 
                             // primitives, and the set of pixels your primitive overlaps onscreen is determined.  This 
                             // launches an instance of the "Fragment Shader", starting the next phase of GPU drawing.
                             
                             // The "Fragment Shader" is more code that gets sent to the graphics card at runtime.  The 
                             // fragment shader runs after the vertex shader on a set of pixels (again, executing in 
                             // parallel on all pixels at once that were overlapped by a primitive).  This of course can 
                             // only happen once the final onscreen position of a primitive is known, which the vertex 
                             // shader found.

                             // The fragment shader fills in (shades) every pixel (fragment) overlapping where the triangle
                             // landed.  It retrieves different values (such as vectors) that are stored at three extreme 
                             // points of the triangle, and then interpolates the values weighted by the pixel's proximity 
                             // to each extreme point, using them in formulas to determine color.  GLSL variables of type 
                             // "varying" appear to have come from a single vertex, but are actually coming from all three,
                             // and are computed for every pixel in parallel by interpolated between the different values of
                             // the variable stored at the three vertices in this fashion.

                             // The fragment colors may or may not become final pixel colors; there could already be other 
                             // triangles' fragments occupying the same pixels.  The Z-Buffer test is applied to see if the 
                             // new triangle is closer to the camera, and even if so, blending settings may interpolate some 
                             // of the old color into the result.  Finally, an image is displayed onscreen.

                             // You must define an update_GPU() function that includes the extra custom JavaScript code 
                             // needed to populate your particular shader program with all the data values it is expecting.
}


const Texture = tiny.Texture =
class Texture extends Graphics_Card_Object
{                                             // **Texture** wraps a pointer to a new texture image where
                                              // it is stored in GPU memory, along with a new HTML image object. 
                                              // This class initially copies the image to the GPU buffers, 
                                              // optionally generating mip maps of it and storing them there too.
  constructor( filename, min_filter = "LINEAR_MIPMAP_LINEAR" )
    { super();
      Object.assign( this, { filename, min_filter } );
                                                // Create a new HTML Image object:
      this.image          = new Image();
      this.image.onload   = () => this.ready = true;
      this.image.crossOrigin = "Anonymous";           // Avoid a browser warning.
      this.image.src = filename;
    }
  copy_onto_graphics_card( context, need_initial_settings = true )
    {                                     // copy_onto_graphics_card():  Called automatically as needed to load the 
                                          // texture image onto one of your GPU contexts for its first time.
      
                // Define what this object should store in each new WebGL Context:
      const initial_gpu_representation = { texture_buffer_pointer: undefined };
                                // Our object might need to register to multiple GPU contexts in the case of 
                                // multiple drawing areas.  If this is a new GPU context for this object, 
                                // copy the object to the GPU.  Otherwise, this object already has been 
                                // copied over, so get a pointer to the existing instance.
      const gpu_instance = super.copy_onto_graphics_card( context, initial_gpu_representation );

      if( !gpu_instance.texture_buffer_pointer ) gpu_instance.texture_buffer_pointer = context.createTexture();

      const gl = context;
      gl.bindTexture  ( gl.TEXTURE_2D, gpu_instance.texture_buffer_pointer );
      
      if( need_initial_settings )
      { gl.pixelStorei  ( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );         // Always use bi-linear sampling when zoomed out.
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[ this.min_filter ]  );  // Let the user to set the sampling method 
      }                                                                                    // when zoomed in.
      
      gl.texImage2D   ( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image );
      if( this.min_filter = "LINEAR_MIPMAP_LINEAR" )      // If the user picked tri-linear sampling (the default) then generate
        gl.generateMipmap(gl.TEXTURE_2D);                 // the necessary "mips" of the texture and store them on the GPU with it.
      return gpu_instance;
    }
  activate( context, texture_unit = 0 )
    {                                     // activate(): Selects this Texture in GPU memory so the next shape draws using it.
                                          // Optionally select a texture unit in case you're using a shader with many samplers.
                                          // Terminate draw requests until the image file is actually loaded over the network:
      if( !this.ready )
        return;
      const gpu_instance = super.activate( context );
      context.activeTexture( context[ "TEXTURE" + texture_unit ] );
      context.bindTexture( context.TEXTURE_2D, gpu_instance.texture_buffer_pointer );
    }
}


const Program_State = tiny.Program_State =
class Program_State extends Container
{                                     // **Program_State** stores any values that affect how your whole scene is drawn, 
                                      // such as its current lights and the camera position.  Class Shader uses whatever
                                      // values are wrapped here as inputs to your custom shader program.  Your Shader
                                      // subclass must override its method "update_GPU()" to define how to send your
                                      // Program_State's particular values over to your custom shader program.
  constructor( camera_transform = Mat4.identity(), projection_transform = Mat4.identity() ) 
    { super();
      this.set_camera( camera_transform );
      const defaults = { projection_transform, animate: true, animation_time: 0, animation_delta_time: 0 };
      Object.assign( this, defaults );
    }
  set_camera( matrix )
    {                       // set_camera():  Applies a new (inverted) camera matrix to the Program_State.
                            // It's often useful to cache both the camera matrix and its inverse.  Both are needed
                            // often and matrix inversion is too slow to recompute needlessly.  
                            // Note that setting a camera matrix traditionally means storing the inverted version, 
                            // so that's the one this function expects to receive; it automatically sets the other.
      Object.assign( this, { camera_transform: Mat4.inverse( matrix ), camera_inverse: matrix } )
    }
}


const Webgl_Manager = tiny.Webgl_Manager =
class Webgl_Manager
{                        // **Webgl_Manager** manages a whole graphics program for one on-page canvas, including its 
                         // textures, shapes, shaders, and scenes.  It requests a WebGL context and stores Scenes.
  constructor( canvas, background_color, dimensions )
    { const members = { instances: new Map(), scenes: [], prev_time: 0, canvas, scratchpad: {}, program_state: new Program_State() };
      Object.assign( this, members );
                                                 // Get the GPU ready, creating a new WebGL context for this canvas:
      for( let name of [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ] )
        if(  this.context = this.canvas.getContext( name ) ) break;
      if( !this.context ) throw "Canvas failed to make a WebGL context.";
      const gl = this.context;

      this.set_size( dimensions );
               
      gl.clearColor.apply( gl, background_color );           // Tell the GPU which color to clear the canvas with each frame.
      gl.getExtension( "OES_element_index_uint" );           // Load an extension to allow shapes with more than 65535 vertices.
      gl.enable( gl.DEPTH_TEST );                            // Enable Z-Buffering test.
                        // Specify an interpolation method for blending "transparent" triangles over the existing pixels:
      gl.enable( gl.BLEND );
      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );           
                                              // Store a single red pixel, as a placeholder image to prevent a console warning:
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture() );
      gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));

              // Find the correct browser's version of requestAnimationFrame() needed for queue-ing up re-display events:
      window.requestAnimFrame = ( w =>
           w.requestAnimationFrame    || w.webkitRequestAnimationFrame
        || w.mozRequestAnimationFrame || w.oRequestAnimationFrame || w.msRequestAnimationFrame
        || function( callback, element ) { w.setTimeout(callback, 1000/60);  } )( window );
    }
  set_size( dimensions = [ 1080, 600 ] )
    {                                   // set_size():  Allows you to re-size the canvas anytime.  To work, it must change the
                                        // size in CSS, wait for style to re-flow, and then change the size again within canvas 
                                        // attributes.  Both are needed because the attributes on a canvas ave a special effect
                                        // on buffers, separate from their style.
      const [ width, height ] = dimensions;
      this.canvas.style[ "width" ]  =  width + "px";
      this.canvas.style[ "height" ] = height + "px";     
      Object.assign( this,        { width, height } );
      Object.assign( this.canvas, { width, height } );
                            // Build the canvas's matrix for converting -1 to 1 ranged coords (NCDS) into its own pixel coords:
      this.context.viewport( 0, 0, width, height );
    }
  render( time=0 )
    {               // render(): Draw a single frame of animation, using all loaded Scene objects.  Measure
                    // how much real time has transpired in order to animate shapes' movements accordingly.
      this.program_state.animation_delta_time = time - this.prev_time;
      if( this.program_state.animate ) this.program_state.animation_time += this.program_state.animation_delta_time;
      this.prev_time = time;

      const gl = this.context;
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);        // Clear the canvas's pixels and z-buffer.

      const open_list = [ ...this.scenes ];
      while( open_list.length )                           // Traverse all Scenes and their children, recursively.
      { open_list.push( ...open_list[0].children );
                                                                // Call display() to draw each registered animation:
        open_list.shift().display( this, this.program_state );
      }
                                              // Now that this frame is drawn, request that render() happen 
                                              // again as soon as all other web page events are processed:
      this.event = window.requestAnimFrame( this.render.bind( this ) );
    }
}


const Scene = tiny.Scene =
class Scene
{                           // **Scene** is the base class for any scene part or code snippet that you can add to a
                            // canvas.  Make your own subclass(es) of this and override their methods "display()" 
                            // and "make_control_panel()" to make them draw to a canvas, or generate custom control
                            // buttons and readouts, respectively.  Scenes exist in a hierarchy; their child Scenes
                            // can either contribute more drawn shapes or provide some additional tool to the end 
                            // user via drawing additional control panel buttons or live text readouts.
  constructor()
    { this.children = [];
                                                          // Set up how we'll handle key presses for the scene's control panel:
      const callback_behavior = ( callback, event ) => 
           { callback( event );
             event.preventDefault();    // Fire the callback and cancel any default browser shortcut that is an exact match.
             event.stopPropagation();   // Don't bubble the event to parent nodes; let child elements be targetted in isolation.
           }
      this.key_controls = new Keyboard_Manager( document, callback_behavior);     
    }
  new_line( parent=this.control_panel )       // new_line():  Formats a scene's control panel with a new line break.
    { parent.appendChild( document.createElement( "br" ) ) }
  live_string( callback, parent=this.control_panel )
    {                                             // live_string(): Create an element somewhere in the control panel that
                                                  // does reporting of the scene's values in real time.  The event loop
                                                  // will constantly update all HTML elements made this way.
      parent.appendChild( Object.assign( document.createElement( "div"  ), { className:"live_string", onload: callback } ) );
    }
  key_triggered_button( description, shortcut_combination, callback, color = '#'+Math.random().toString(9).slice(-6), 
                        release_event, recipient = this, parent = this.control_panel )
    {                                             // key_triggered_button():  Trigger any scene behavior by assigning
                                                  // a key shortcut and a labelled HTML button to fire any callback 
                                                  // function/method of a Scene.  Optional release callback as well.
      const button = parent.appendChild( document.createElement( "button" ) );
      button.default_color = button.style.backgroundColor = color;
      const  press = () => { Object.assign( button.style, { 'background-color' : 'red', 
                                                            'z-index': "1", 'transform': "scale(2)" } );
                             callback.call( recipient );
                           },
           release = () => { Object.assign( button.style, { 'background-color' : button.default_color, 
                                                            'z-index': "0", 'transform': "scale(1)" } );
                             if( !release_event ) return;
                             release_event.call( recipient );
                           };
      const key_name = shortcut_combination.join( '+' ).split( " " ).join( "Space" );
      button.textContent = "(" + key_name + ") " + description;
      button.addEventListener( "mousedown" , press );
      button.addEventListener( "mouseup",  release );
      button.addEventListener( "touchstart", press, { passive: true } );
      button.addEventListener( "touchend", release, { passive: true } );
      if( !shortcut_combination ) return;
      this.key_controls.add( shortcut_combination, press, release );
    }                                                          
                                                // To use class Scene, override at least one of the below functions,
                                                // which will be automatically called by other classes:
  display( context, program_state )
    {}                            // display(): Called by Webgl_Manager for drawing.
  make_control_panel()
    {}                            // make_control_panel(): Called by Controls_Widget for generating interactive UI.
  show_explanation( document_section )
    {}                            // show_explanation(): Called by Text_Widget for generating documentation.
}


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map