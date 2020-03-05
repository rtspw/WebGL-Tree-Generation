
import { tiny } from '../tiny-graphics.js';
const { Shape, Vector, vec3 } = tiny;

class Leaf extends Shape {                                 
  constructor() {
      super( "position", "normal", "texture_coord" );
      this.arrays.position = [ vec3(-.5,0,.1), vec3(0,0,0), vec3(0,0.866,0), vec3(.5,0,.1)];
      this.arrays.normal = [ vec3(0,0,1), vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) ];
      this.indices = [ 0, 1, 2, 1, 3, 2 ];
    }
}

export default Leaf;