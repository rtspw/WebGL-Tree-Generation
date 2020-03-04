import { tiny } from './tiny-graphics.js';
import { Movement_Controls } from './scene-components.js';

import Phong_Shader from './shaders/phong-shader.js';
import Phong_With_Fog_Shader from './shaders/phong-with-fog-shader.js';

import OffsetSquare from './shapes/offset-square.js';
import Subdivision_Sphere from './shapes/subdivision-sphere.js';
import Cube from './shapes/cube.js';

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
      fogIntensity: 0.25,
      groundColor: [.5, .6, .4, 1],
      groundOptions: {
        columnDivisions: 16,
        rowDivisions: 10,
        bumpiness: 0.035,
        rowNoiseFactor: .7,
        colNoiseFactor: .7,
      },
      sunColor: [1, 1, 1, 1],
      sunlightColor: [255/255, 244/255, 229/255, 1],
      moonColor: [255/255, 244/255, 229/255, 1],
      moonlightColor: [.7, .7, 1, 1],
      rotationsPerMinute: 5,
    }

    this.shapes = {
      sphere: new Subdivision_Sphere(4),
      cube: new Cube(),
      offsetSquare: new OffsetSquare(this.settings.groundOptions),
    };

    this.shaders = {
      phongWithFog: new Phong_With_Fog_Shader(2, color(...this.settings.fogColor), this.settings.fogIntensity),
      phong: new Phong_Shader(2), 
    }

    this.materials = {
      ground: new Material(this.shaders.phongWithFog, { ambient: 0, diffusivity: .7, specularity: .2, color: color(...this.settings.groundColor) }),
      metal: new Material(this.shaders.phongWithFog, { ambient: 0, diffusivity: .2, specularity: .95, color: color(.4, .4, .6, 1) }),
      sun: new Material(this.shaders.phong, { ambient: 1, diffusivity: 1, specularity: 0, color: color(...this.settings.sunColor) }),
      moon: new Material(this.shaders.phong, { ambient: 1, diffusivity: 1, specularity: 0, color: color(...this.settings.moonColor) }),
    };

    this.positions = {
      sun: [0, 0, 0, 1],
      moon: [0, 0, 0, 1],
    }

    this.initialized = false;
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
      state.set_camera(Mat4.look_at(vec3(0, 10, 25), vec3(0, 0, -50), vec3(0, 1, 0)));
    }
    state.projection_transform = Mat4.perspective(Math.PI/4, context.width/context.height, 1, 100);
    this.initialized = true;
  }

  updateGround(context, state) {
    const ground_matrix = Mat4.identity()
      .times(Mat4.scale(50, 50, 50))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
    this.shapes.offsetSquare.draw(context, state, ground_matrix, this.materials.ground);
  }

  updateSun(context, state) {
    const sunlightIntensity = Math.max(100000, this.positions.sun[1] * 10000000);
    state.lights[0] = new Light(vec4(...this.positions.sun), color(...this.settings.sunlightColor), sunlightIntensity);
    const sunMatrix = Mat4.identity()
      .times(Mat4.rotation(2 * Math.PI * (state.animation_time / 1000) * (this.settings.rotationsPerMinute / 60), 1, 0, 1))
      .times(Mat4.translation(0, 65, 0))
      .times(Mat4.scale(2, 2, 2))
    this.positions.sun = [...sunMatrix.times(vec4(0, 0, 0, 1))]
    this.shapes.sphere.draw(context, state, sunMatrix, this.materials.sun );
  }

  updateMoon(context, state) {
    const moonlightIntensity = Math.max(100000, this.positions.moon[1] * 100000);
    state.lights[1] = new Light(vec4(...this.positions.moon), color(...this.settings.moonlightColor), moonlightIntensity);
    const moonMatrix = Mat4.identity()
      .times(Mat4.rotation(2 * Math.PI * (state.animation_time / 1000) * (this.settings.rotationsPerMinute / 60), 1, 0, 1))
      .times(Mat4.translation(0, -65, 0))
      .times(Mat4.scale(1, 1, 1))
    this.positions.moon = [...moonMatrix.times(vec4(0, 0, 0, 1))];
    this.shapes.sphere.draw(context, state, moonMatrix, this.materials.moon );
  }

  updateSky(context, state) {
    const updatedFogColor = getColorFromSpectrum(this.positions.sun[1] / 50);
    this.materials.ground.shader.fogColor = color(...updatedFogColor);
    this.materials.ground.specularity = Math.max(0, this.positions.sun[1] / 50) / 2;
    this.materials.metal.specularity = Math.max(0, this.positions.sun[1] / 50) / 2;
    this.materials.ground.ambient = Math.max(0.1, this.positions.sun[1] / 50) / 2;
    this.materials.metal.ambient = Math.max(0.1, this.positions.sun[1] / 50) / 2;
    context.context.clearColor(...updatedFogColor);
  }

  display(context, state) {
    if (!this.initialized) this.initializeScene(context, state);
    this.updateSun(context, state);
    this.updateMoon(context, state);
    this.updateGround(context, state);
    this.shapes.cube.draw(context, state, Mat4.translation(0, 1.5, 0), this.materials.metal);
    this.updateSky(context, state);
  }

  make_control_panel() {}
}

export default MainScene;