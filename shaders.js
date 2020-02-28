import { tiny } from './tiny-graphics.js';

const {
  Shader, Matrix, color, vec4, Mat4
} = tiny;

class Phong_Shader extends Shader
{                                  // **Phong_Shader** is a subclass of Shader, which stores and maanges a GPU program.  
                                   // Graphic cards prior to year 2000 had shaders like this one hard-coded into them
                                   // instead of customizable shaders.  "Phong-Blinn" Shading here is a process of 
                                   // determining brightness of pixels via vector math.  It compares the normal vector
                                   // at that pixel with the vectors toward the camera and light sources.

  
  constructor( num_lights = 2 )
    { super(); 
      this.num_lights = num_lights;
    }

  shared_glsl_code()           // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
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
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return this.shared_glsl_code() + `
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
  fragment_glsl_code()         // ********* FRAGMENT SHADER ********* 
    {                          // A fragment is a pixel that's overlapped by the current triangle.
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

class Funny_Shader extends Shader
{                                        // **Funny_Shader**: A simple "procedural" texture shader, with 
                                         // texture coordinates but without an input image.
  update_GPU( context, gpu_addresses, program_state, model_transform, material )
      {        // update_GPU():  Define how to synchronize our JavaScript's variables to the GPU's:
        const [ P, C, M ] = [ program_state.projection_transform, program_state.camera_inverse, model_transform ],
                      PCM = P.times( C ).times( M );
        context.uniformMatrix4fv( gpu_addresses.projection_camera_model_transform, false, Mat4.flatten_2D_to_1D( PCM.transposed() ) );
        context.uniform1f ( gpu_addresses.animation_time, program_state.animation_time / 1000 );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec2 f_tex_coord;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return this.shared_glsl_code() + `
        attribute vec3 position;                            // Position is expressed in object coordinates.
        attribute vec2 texture_coord;
        uniform mat4 projection_camera_model_transform;

        void main()
        { gl_Position = projection_camera_model_transform * vec4( position, 1.0 );   // The vertex's final resting place (in NDCS).
          f_tex_coord = texture_coord;                                       // Directly use original texture coords and interpolate between.
        }`;
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return this.shared_glsl_code() + `
        uniform float animation_time;
        void main()
        { float a = animation_time, u = f_tex_coord.x, v = f_tex_coord.y;   
                                                                  // Use an arbitrary math function to color in all pixels as a complex                                                                  
          gl_FragColor = vec4(                                    // function of the UV texture coordintaes of the pixel and of time.  
            2.0 * u * sin(17.0 * u ) + 3.0 * v * sin(11.0 * v ) + 1.0 * sin(13.0 * a),
            3.0 * u * sin(18.0 * u ) + 4.0 * v * sin(12.0 * v ) + 2.0 * sin(14.0 * a),
            4.0 * u * sin(19.0 * u ) + 5.0 * v * sin(13.0 * v ) + 3.0 * sin(15.0 * a),
            5.0 * u * sin(20.0 * u ) + 6.0 * v * sin(14.0 * v ) + 4.0 * sin(16.0 * a));
        }`;
    }
}

class Phong_With_Fog_Shader extends Phong_Shader { 
  constructor(num_lights = 2, fogFactor = .5){ 
    super(num_lights); 
    this.fogFactor = fogFactor;
  }

  send_material( gl, gpu, material ) {                          
    super.send_material(gl, gpu, material);
    gl.uniform1f (gpu.fogFactor, this.fogFactor);
  }

  send_gpu_state( gl, gpu, gpu_state, model_transform ) {   
    super.send_gpu_state(gl, gpu, gpu_state, model_transform);
    gl.uniformMatrix4fv( gpu.camera_transform, false, Matrix.flatten_2D_to_1D(gpu_state.camera_inverse.transposed()));
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

      void main(){
        float fogIntensity = 1.0 - smoothstep(0.0, 1.0, (fogFactor * camera_depth) / 25.0);
        gl_FragColor = vec4(shape_color.xyz * ambient, shape_color.w);
        gl_FragColor.xyz += phong_model_lights(normalize(N), vertex_worldspace);
        gl_FragColor = mix(vec4(.8, .7, .9, 1), gl_FragColor, fogIntensity);
      }
    `;
  }
}

export { Phong_Shader, Phong_With_Fog_Shader, Funny_Shader };