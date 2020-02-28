import { tiny } from './tiny-graphics.js';
import { Movement_Controls } from './scene-components.js';
import { Triangle, Cube, Square, Grid_Patch, Subdivision_Sphere } from './shapes.js';
import { Phong_Shader, Phong_With_Fog_Shader } from './shaders.js';

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
    const initial_corner_point = vec3( -1,-1,0 );
    const row_operation = (s,p) => p ? Mat4.translation( 0,.2,0 ).times(p.to4(1)).to3() 
                                       : initial_corner_point;
      const column_operation = (t,p) =>  Mat4.translation( .2,0,0 ).times(p.to4(1)).to3();

    this.shapes = {
      triangle: new Triangle(),
      square: new Square(),
      cube: new Cube(),
      gridPatch: new Grid_Patch(10, 10, row_operation, column_operation),
      sphere: new Subdivision_Sphere(4),
    };

    this.materials = {
      ground: new Material(new Phong_With_Fog_Shader(1, .5), { ambient: .5, diffusivity: .7, specularity: .2, color: color(.5, .6, .8 ,1) }),
      light: new Material(new Phong_Shader(1), { ambient: 1, color: color(1, 1, 1, 1) }),
    };

    this.positions = {
      sun: [0, 5, 5, 0],
    }

    this.initialized = false;
  }

  display(context, state) {

    if (!this.initialized) {
      state.lights = [new Light(vec4(...this.positions.sun), color(1, 1, 1, 1), 1000000 )];
      context.context.clearColor(.8, .7, .9, 1);
      if (!context.scratchpad.controls) {
        context.scratchpad.controls = new Movement_Controls();
        this.children.push(context.scratchpad.controls);
        state.set_camera(Mat4.look_at(vec3(0, 5, 10), vec3(0, 0, 0), vec3(0, 1, 0)));
      }
      this.initialized = true;
      console.log(state)
    }

    state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 100 );
    
      const ground_matrix = Mat4.identity()
      // .times(Mat4.rotation(Math.PI / 4, 1, 1, 1))
        .times(Mat4.scale(50, .01, 50));
      
   
      this.shapes.cube.draw(context, state, ground_matrix, this.materials.ground)
  


    this.positions.sun[1] = this.positions.sun[1] - (state.animation_time / 10000000);
    state.lights[0] = new Light(vec4(...this.positions.sun), color(1, 1, 1, 1), 100000);
    this.shapes.sphere.draw(context, state, Mat4.identity()
      .times(Mat4.translation(...this.positions.sun))
      .times(Mat4.scale(.1, .1, .1))
    , this.materials.light )
  }

  make_control_panel() {
    this.key_triggered_button( "Previous group", [ "g" ],  () => {});
    this.key_triggered_button(     "Next group", [ "h" ],  () => {}); 
  }

}

export default MainScene;