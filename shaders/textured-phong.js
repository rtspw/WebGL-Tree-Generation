import Phong_Shader from './phong-shader.js';

// **Textured_Phong** is a Phong Shader extended to addditionally decal a
// texture image over the drawn shape, lined up according to the texture
// coordinates that are stored at each shape vertex.
class Textured_Phong extends Phong_Shader {                       
  vertex_glsl_code() { 
    return this.shared_glsl_code() + `
      varying vec2 f_tex_coord;
      // Position is expressed in object coordinates.
      attribute vec3 position, normal;                            
      attribute vec2 texture_coord;
      
      uniform mat4 model_transform;
      uniform mat4 projection_camera_model_transform;
      void main() { 
        // The vertex's final resting place (in NDCS):
        gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
        // The final normal vector in screen space.
        N = normalize( mat3( model_transform ) * normal / squared_scale);
        vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
        // Turn the per-vertex texture coordinate into an interpolated variable.
        f_tex_coord = texture_coord;
      }
    `;
  }


  // A fragment is a pixel that's overlapped by the current triangle.
  // Fragments affect the final image or get discarded due to depth.   
  fragment_glsl_code() {                                                     
    return this.shared_glsl_code() + `
      varying vec2 f_tex_coord;
      uniform sampler2D texture;
      void main() {                                                          
        // Sample the texture image in the correct place:
        vec4 tex_color = texture2D( texture, f_tex_coord );
        if( tex_color.w < .01 ) discard;
        // Compute an initial (ambient) color:
        gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
        // Compute the final color with contributions from lights:
        gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
      }
    `;
  }

  update_GPU( context, gpu_addresses, gpu_state, model_transform, material ) {                  
    super.update_GPU( context, gpu_addresses, gpu_state, model_transform, material );                         
    if( material.texture && material.texture.ready ) {                         
      // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
      context.uniform1i( gpu_addresses.texture, 0);
      // For this draw, use the texture image from correct the GPU buffer:
      material.texture.activate( context );
    }
  }
}

export default Textured_Phong;
