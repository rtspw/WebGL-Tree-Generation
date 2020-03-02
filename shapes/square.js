import { tiny } from '../tiny-graphics.js';
const { Shape, Vector, Vector3 } = tiny;

/**
 * **Square** demonstrates two triangles that share vertices.  On any planar surface, the 
 * interior edges don't make any important seams.  In these cases there's no reason not
 * to re-use data of the common vertices between triangles.  This makes all the vertex 
 * arrays (position, normals, etc) smaller and more cache friendly.
 */
class Square extends Shape {                                 
  constructor() { 
    super( "position", "normal", "texture_coord" );                           
    this.arrays.position = Vector3.cast([-1,-1,0], [1,-1,0], [-1,1,0], [1,1,0]);
    this.arrays.normal = Vector3.cast([0,0,1], [0,0,1], [0,0,1], [0,0,1]);
    this.arrays.texture_coord = Vector.cast([0,0], [1,0], [0,1], [1,1]);
    this.indices.push(0, 1, 2, 1, 3, 2);
  }
}

export default Square;