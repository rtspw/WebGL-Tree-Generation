import { tiny } from '../tiny-graphics.js';
const { Shape, Mat4 } = tiny;

import Square from './square.js';

// **Cube** A closed 3D shape, and the first example of a compound shape (a Shape constructed
// out of other Shapes).  A cube inserts six Square strips into its own arrays, using six
// different matrices as offsets for each square.
class Cube extends Shape {                         
  constructor() { 
    super( "position", "normal", "texture_coord" );
      // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
      for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 2; j++ ) { 
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0,    1,0,0 )
            .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ),   0,1,0 ) )
            .times( Mat4.translation( 0,0,1 ) );

          // Calling this function of a Square (or any Shape) copies it into the specified
          // Shape (this one) at the specified matrix offset (square_transform):
          Square.insert_transformed_copy_into( this, [], square_transform );
        }
    }
}

export default Cube;