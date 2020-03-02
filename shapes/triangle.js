
import { tiny } from '../tiny-graphics.js';
const { Shape, Vector, vec3 } = tiny;

// **Triangle** The simplest possible 2D Shape – one triangle.  It stores 3 vertices, each
// having their own 3D position, normal vector, and texture-space coordinate.
class Triangle extends Shape {                                 
  constructor() {
      super( "position", "normal", "texture_coord" );
      this.arrays.position = [ vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) ];
      this.arrays.normal = [ vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) ];
      this.arrays.texture_coord = [ Vector.of(0,0),   Vector.of(1,0), Vector.of(0,1) ]; 
      this.indices = [ 0, 1, 2 ];
    }
}

export default Triangle;