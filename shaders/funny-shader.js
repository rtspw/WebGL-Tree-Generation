import { tiny } from '../tiny-graphics.js';
const { Shader, Mat4 } = tiny;

// **Funny_Shader**: A simple "procedural" texture shader, with 
// texture coordinates but without an input image.
class Funny_Shader extends Shader {                        

  // update_GPU():  Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( context, gpu_addresses, program_state, model_transform, material ) {
    const [ P, C, M ] = [ program_state.projection_transform, program_state.camera_inverse, model_transform ];
    const PCM = P.times( C ).times( M );
    context.uniformMatrix4fv( gpu_addresses.projection_camera_model_transform, false, Mat4.flatten_2D_to_1D( PCM.transposed() ) );
    context.uniform1f ( gpu_addresses.animation_time, program_state.animation_time / 1000 );
  }

  shared_glsl_code() {
    return `
      precision mediump float;
      varying vec2 f_tex_coord;
    `;
  }
  
  vertex_glsl_code() { 
    return this.shared_glsl_code() + `
      attribute vec3 position; // Position is expressed in object coordinates.
      attribute vec2 texture_coord;
      uniform mat4 projection_camera_model_transform;

      void main() { 
        gl_Position = projection_camera_model_transform * vec4( position, 1.0 );   // The vertex's final resting place (in NDCS).
        f_tex_coord = texture_coord;                                               // Directly use original texture coords and interpolate between.
      }`;
  }

  fragment_glsl_code() { 
    return this.shared_glsl_code() + `
      uniform float animation_time;
      void main() { 
        float a = animation_time, u = f_tex_coord.x, v = f_tex_coord.y;   
        // Use an arbitrary math function to color in all pixels as a complex    
        // function of the UV texture coordintaes of the pixel and of time.                                                               
        gl_FragColor = vec4(
          2.0 * u * sin(17.0 * u ) + 3.0 * v * sin(11.0 * v ) + 1.0 * sin(13.0 * a),
          3.0 * u * sin(18.0 * u ) + 4.0 * v * sin(12.0 * v ) + 2.0 * sin(14.0 * a),
          4.0 * u * sin(19.0 * u ) + 5.0 * v * sin(13.0 * v ) + 3.0 * sin(15.0 * a),
          5.0 * u * sin(20.0 * u ) + 6.0 * v * sin(14.0 * v ) + 4.0 * sin(16.0 * a)
        );
      }
    `;
  }
}

export default Funny_Shader;