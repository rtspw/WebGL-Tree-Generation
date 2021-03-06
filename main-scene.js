import { tiny } from './tiny-graphics.js';
import { Movement_Controls } from './scene-components.js';

import Phong_Shader from './shaders/phong-shader.js';
import Phong_With_Fog_Shader from './shaders/phong-with-fog-shader.js';

import Leaf from './shapes/leaf.js';
import OffsetSquare from './shapes/offset-square.js';
import Subdivision_Sphere from './shapes/subdivision-sphere.js';
import Cube from './shapes/cube.js';
import TreeBark from './shapes/tree-bark.js';

import TreeGenerator from './generate-tree.js';

const {
  Scene,
  vec3,
  Mat4,
  Material,
  color,
  Light,
  vec4,
} = tiny;

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

// 1   - 240,248,255
// .5  - 248,177,149
// .4  - 246,114,128
// .3  - 192,108,132
// .1  - 108,91,123
// -.2 - 53,92,125
// -1  - 25,25,50
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
        initialReleaseInterval: 1,
        releaseIntervalNoiseRange: [0, 0.25],
        baseVelocity: [0, 1, 7],
        noiseRange: {
          x: [0, 1],
          y: [0, 1],
          z: [-1, 1],
        },
        sizeRange: [0.5, 1.2],
        colorRange: {
          r: [0, .5],
          g: [.3, .6],
          b: [0, .5],
          a: [1, 1],
        },
        baseRotationSpeed: 0.01,
        rotationNoiseRange: [0, 0.05],
        decaySpeed: 0.01,
        removalThreshold: 0.05,
      },
      treeOptions: {
        initialDirectionVector: vec3(0, 1, 0),
        baseLength: 6,
        baseRadius: 1.5,
        cutoffThreshold: 1.1,
        leafThreshold: 2,
        lengthDecayRate: 0.9,
        radiusDecayRate: .5,
        minSplitAngle: 0,
        maxSplitAngle: Math.PI / 2.5,
        branchLengthLowerBoundFactor: 0.75,
        extraTrunkLength: 2,
        useSmoothShading: true,
      },
      isAutumn: false,
    }

    this.shapes = {
      leaf: new Leaf(),
      sphere: new Subdivision_Sphere(4),
      cube: new Cube(),
      offsetSquare: new OffsetSquare(this.settings.groundOptions),
      offsetSquare2: new OffsetSquare(this.settings.mountainOptions),
      treebark: new TreeBark(1 - this.settings.treeOptions.radiusDecayRate, this.settings.treeOptions.useSmoothShading),
    };

    this.shaders = {
      phongWithFog: new Phong_With_Fog_Shader(2, color(...this.settings.fogColor), this.settings.fogIntensity),
      phong: new Phong_Shader(2), 
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

    const generatedTree = new TreeGenerator(this.settings.treeOptions).generateTree();
    this.branches = generatedTree.branches;
    this.leaves = generatedTree.leaves.map(leafPosition => {
      const uniqueLeaf = this.generateLeaf(true)
      uniqueLeaf.position = [...leafPosition];
      return uniqueLeaf;
    });

    this.initialized = false;
  }

  generateLeaf(isStatic = false) {
    const {
      baseVelocity,
      noiseRange,
      sizeRange,
      colorRange,
    } = this.settings.leafOptions;
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
    
    const randomPosition = [...this.leaves[Math.round(uniformRV(0, this.leaves.length - 1))].position, 1];
    return { 
      position: randomPosition,
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
      context.scratchpad.controls = new Movement_Controls();
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
        | Column Divisions: ${this.settings.groundOptions.columnDivisions.toFixed(3)}
        | Row Noise: ${this.settings.groundOptions.rowNoiseFactor.toFixed(3)}
        | Column Noise: ${this.settings.groundOptions.colNoiseFactor.toFixed(3)}
      `
    });
    this.new_line();
    this.key_triggered_button('Generate new ground', [''], () => { this.shapes.offsetSquare = new OffsetSquare(this.settings.groundOptions) });
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
    this.key_triggered_button('Generate new mountain', [''], () => { this.shapes.offsetSquare2 = new OffsetSquare(this.settings.mountainOptions) });
    this.new_line();
    this.live_string(elem => { elem.textContent = `
      Base Length: ${this.settings.treeOptions.baseLength.toFixed(3)}
      | Base Radius: ${this.settings.treeOptions.baseRadius.toFixed(3)}
      | Cutoff Threshold: ${this.settings.treeOptions.cutoffThreshold.toFixed(3)}
      | Leaf Threshold: ${this.settings.treeOptions.leafThreshold.toFixed(3)}
    `});
    this.new_line();
    this.live_string(elem => { elem.textContent = `
      Branch Length Decay Factor: ${this.settings.treeOptions.lengthDecayRate.toFixed(3)}
      | Radius Decay Factor: ${this.settings.treeOptions.radiusDecayRate.toFixed(3)}
      | Leaf Size Lower Range: ${this.settings.leafOptions.sizeRange[0].toFixed(3)}
    `});
    this.new_line();
    this.live_string(elem => { elem.textContent = `
      Leaf Size Upper Range: ${this.settings.leafOptions.sizeRange[1].toFixed(3)}
      | Extra Base Length: ${this.settings.treeOptions.extraTrunkLength.toFixed(3)}
      | Min Angle: ${this.settings.treeOptions.minSplitAngle.toFixed(3)}
      | Max Angle: ${this.settings.treeOptions.maxSplitAngle.toFixed(3)}
    `});
    this.new_line();
    this.key_triggered_button('(+) Base Length', [''], () => { this.settings.treeOptions.baseLength += 0.1 });
    this.key_triggered_button('(-) Base Length', [''], () => { this.settings.treeOptions.baseLength -= 0.1 });
    this.key_triggered_button('(+) Base Radius', [''], () => { this.settings.treeOptions.baseRadius += 0.1 });
    this.key_triggered_button('(-) Base Radius', [''], () => { this.settings.treeOptions.baseRadius -= 0.1 });
    this.new_line();
    this.key_triggered_button('(+) Cutoff', [''], () => { this.settings.treeOptions.cutoffThreshold += 0.05 });
    this.key_triggered_button('(-) Cutoff', [''], () => { 
      this.settings.treeOptions.cutoffThreshold -= 0.05;
      if (this.settings.treeOptions.cutoffThreshold < 0.75 && !this.gaveAlert) {
        alert('Warning: low cutoff values may cause lag or page crashes!');
        this.gaveAlert = true;
      }
    });
    this.key_triggered_button('(+) Leaf Threshold', [''], () => { this.settings.treeOptions.leafThreshold += 0.1 });
    this.key_triggered_button('(-) Leaf Threshold', [''], () => { this.settings.treeOptions.leafThreshold -= 0.1 });
    this.key_triggered_button('(+) Leaf Size', [''], () => { 
      this.settings.leafOptions.sizeRange[0] += 0.1;
      this.settings.leafOptions.sizeRange[1] += 0.1;
    });
    this.key_triggered_button('(-) Leaf Size', [''], () => { 
      this.settings.leafOptions.sizeRange[0] -= 0.1;
      this.settings.leafOptions.sizeRange[1] -= 0.1;
    });
    this.key_triggered_button('(+) Min Angle', [''], () => { this.settings.treeOptions.minSplitAngle += Math.PI / 32 });
    this.key_triggered_button('(-) Min Angle', [''], () => { this.settings.treeOptions.minSplitAngle -= Math.PI / 32 });
    this.key_triggered_button('(+) Max Angle', [''], () => { this.settings.treeOptions.maxSplitAngle += Math.PI / 32 });
    this.key_triggered_button('(-) Max Angle', [''], () => { this.settings.treeOptions.maxSplitAngle -= Math.PI / 32 });
    this.new_line();
    this.key_triggered_button('Generate new tree', ['c'], () => { 
      const newTree = new TreeGenerator(this.settings.treeOptions).generateTree();
      this.branches = newTree.branches;
      this.leaves = newTree.leaves.map(leafPosition => {
        const uniqueLeaf = this.generateLeaf(true)
        uniqueLeaf.position = [...leafPosition];
        return uniqueLeaf;
      });
    });
    this.key_triggered_button('Toggle tree shading', [''], () => {
      this.settings.treeOptions.useSmoothShading = !this.settings.treeOptions.useSmoothShading;
      this.shapes.treebark = new TreeBark(1 - this.settings.treeOptions.radiusDecayRate, this.settings.treeOptions.useSmoothShading)
    })
    this.key_triggered_button('Switch leaf palette', [''], () => {
      this.settings.isAutumn = !this.settings.isAutumn;
      if (this.settings.isAutumn) {
        this.settings.leafOptions.colorRange.r = [.5, 1];
      } else {
        this.settings.leafOptions.colorRange.r = [0, .5];
      }
      this.leaves = this.leaves.map(leaf => {
        leaf.color = [
          uniformRV(...this.settings.leafOptions.colorRange.r), 
          uniformRV(...this.settings.leafOptions.colorRange.g), 
          uniformRV(...this.settings.leafOptions.colorRange.b), 
          uniformRV(...this.settings.leafOptions.colorRange.a)
        ];
        return leaf;
      });
    })
  }
}

export default MainScene;