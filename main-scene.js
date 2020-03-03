import { tiny } from './tiny-graphics.js';
import { Movement_Controls } from './scene-components.js';

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

function lerpRGB(colorA, colorB, factor = 0.5) {
  return [
    colorA[0] + (colorB[0]-colorA[0]) * factor,
    colorA[1] + (colorB[1]-colorA[1]) * factor,
    colorA[2] + (colorB[2]-colorA[2]) * factor,
    colorA[3] + (colorB[3]-colorA[3]) * factor,
  ];
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
      fogColor: [.3, .8, .9, 0],
      fogIntensity: 0.4,
      groundColor: [.5, .6, .4, 1],
      groundOptions: {
        columnDivisions: 16,
        rowDivisions: 10,
        bumpiness: 0.02,
        rowNoiseFactor: .8,
        colNoiseFactor: .8,
      }
    }

    this.shapes = {
      sphere: new Subdivision_Sphere(4),
      cube: new Cube(),
      offsetSquare: new OffsetSquare(this.settings.groundOptions),
    };

    this.shaders = {
      phongWithFog: new Phong_With_Fog_Shader(1, color(...this.settings.fogColor), this.settings.fogIntensity),
    }

    this.materials = {
      ground: new Material(this.shaders.phongWithFog, { ambient: .5, diffusivity: .7, specularity: .2, color: color(...this.settings.groundColor) }),
      light: new Material(this.shaders.phongWithFog, { ambient: 1, color: color(1, 1, 1, 1) }),
    };

    this.positions = {
      sun: [0, 10, 0, 1],
    }

    this.initialized = false;
  }

  display(context, state) {

    if (!this.initialized) {
      state.lights = [new Light(vec4(...this.positions.sun), color(1, 1, 1, 1), 1000000000)];
      context.context.clearColor(...this.settings.fogColor);
      if (!context.scratchpad.controls) {
        context.scratchpad.controls = new Movement_Controls();
        this.children.push(context.scratchpad.controls);
        state.set_camera(Mat4.look_at(vec3(0, 5, 10), vec3(0, 0, 0), vec3(0, 1, 0)));
      }
      state.projection_transform = Mat4.perspective(Math.PI/4, context.width/context.height, 1, 100);
      this.initialized = true;
      console.log(context)
      console.log(state)
      console.log(lerpRGB(this.settings.fogColor, [1, 0, 0, 1], .5))
    }

    state.lights[0] = new Light(vec4(...this.positions.sun), color(1, 1, 1, 1), 100000000);

    const ground_matrix = Mat4.identity()
      .times(Mat4.scale(40, 40, 40))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
    
    this.shapes.offsetSquare.draw(context, state, ground_matrix, this.materials.ground);

    this.shapes.cube.draw(context, state, Mat4.translation(0, .5, 0), this.materials.ground);

    const sun_matrix = Mat4.identity()
      .times(Mat4.translation(...this.positions.sun))
      .times(Mat4.scale(.1, .1, .1))
    
    this.shapes.sphere.draw(context, state, sun_matrix, this.materials.light );
    
    const newColor = lerpRGB(this.settings.fogColor, [.2,.2,.2, 1], state.animation_time / 100000);
    this.materials.ground.shader.fogColor = color(...newColor)
    context.context.clearColor(...newColor);
  }

  make_control_panel() {
    this.key_triggered_button('Sun -Z', ['i'],  () => {
      this.positions.sun[2] = this.positions.sun[2] - 1;
    });
    this.key_triggered_button('Sun +Z', ['k'],  () => {
      this.positions.sun[2] = this.positions.sun[2] + 1;
    });
    this.key_triggered_button('Sun -X', ['j'],  () => {
      this.positions.sun[0] = this.positions.sun[0] - 1;
    });
    this.key_triggered_button('Sun +X', ['l'],  () => {
      this.positions.sun[0] = this.positions.sun[0] + 1;
    });
    this.key_triggered_button('Sun -Y', ['h'],  () => {
      this.positions.sun[1] = this.positions.sun[1] - 1;
    });
    this.key_triggered_button('Sun +Y', ['y'],  () => {
      this.positions.sun[1] = this.positions.sun[1] + 1;
    });
  }

}

export default MainScene;