import { tiny } from './tiny-graphics.js';
import { Movement_Controls } from './scene-components.js';

import Phong_With_Fog_Shader from './shaders/phong-with-fog-shader.js';

import OffsetSquare from './shapes/offset-square.js';
import Subdivision_Sphere from './shapes/subdivision-sphere.js';

const {
  Scene,
  vec3,
  Mat4,
  Material,
  color,
  Light,
  vec4,
} = tiny;


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
      fogColor: [.7, .7, .9, 1],
      fogIntensity: 0.5,
      groundColor: [.5, .6, .4, 1],
    }

    this.shapes = {
      sphere: new Subdivision_Sphere(4),
      offsetSquare: new OffsetSquare({columnDivisions: 10, rowDivisions: 4, bumpiness: 0.05 }, 10, 4, .05),
    };

    this.shaders = {
      phongWithFog: new Phong_With_Fog_Shader(1, color(...this.settings.fogColor), this.settings.fogIntensity),
    }

    this.materials = {
      ground: new Material(this.shaders.phongWithFog, { ambient: .5, diffusivity: .7, specularity: .7, color: color(...this.settings.groundColor) }),
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
    }

    state.lights[0] = new Light(vec4(...this.positions.sun), color(1, 1, 1, 1), 100000000);

    const ground_matrix = Mat4.identity()
      .times(Mat4.scale(20, 20, 20))
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
    
    this.shapes.offsetSquare.draw(context, state, ground_matrix, this.materials.ground);

    const sun_matrix = Mat4.identity()
      .times(Mat4.translation(...this.positions.sun))
      .times(Mat4.scale(.1, .1, .1))
    
    this.shapes.sphere.draw(context, state, sun_matrix, this.materials.light )
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