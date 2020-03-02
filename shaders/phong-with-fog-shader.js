import { tiny } from '../tiny-graphics.js';
const { Matrix, color } = tiny;

import Phong_Shader from './phong-shader.js';


class Phong_With_Fog_Shader extends Phong_Shader { 
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

export default Phong_With_Fog_Shader;