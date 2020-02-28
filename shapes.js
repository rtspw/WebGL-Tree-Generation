import { tiny } from './tiny-graphics.js';

const {
  Shape, Vector, vec3, Mat4, Vector3,
} = tiny;

class Triangle extends Shape
{                                 // **Triangle** The simplest possible 2D Shape – one triangle.  It stores 3 vertices, each
                                  // having their own 3D position, normal vector, and texture-space coordinate.
  constructor()
    {                             // Name the values we'll define per each vertex:
      super( "position", "normal", "texture_coord" );
                                  // First, specify the vertex positions -- the three point locations of an imaginary triangle:
      this.arrays.position      = [ vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) ];
                                  // Next, supply vectors that point away from the triangle face.  They should match up with 
                                  // the points in the above list.  Normal vectors are needed so the graphics engine can
                                  // know if the shape is pointed at light or not, and color it accordingly.
      this.arrays.normal        = [ vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) ];
                                  //  lastly, put each point somewhere in texture space too:
      this.arrays.texture_coord = [ Vector.of(0,0),   Vector.of(1,0),   Vector.of(0,1)   ]; 
                                  // Index into our vertices to connect them into a whole triangle:
      this.indices        = [ 0, 1, 2 ];
                       // A position, normal, and texture coord fully describes one "vertex".  What's the "i"th vertex?  Simply
                       // the combined data you get if you look up index "i" of those lists above -- a position, normal vector,
                       // and texture coordinate together.  Lastly we told it how to connect vertex entries into triangles.
                       // Every three indices in "this.indices" traces out one triangle.
    }
}

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

class Cube extends Shape
{                         // **Cube** A closed 3D shape, and the first example of a compound shape (a Shape constructed
                          // out of other Shapes).  A cube inserts six Square strips into its own arrays, using six
                          // different matrices as offsets for each square.
  constructor()  
    { super( "position", "normal", "texture_coord" );
                          // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
      for( var i = 0; i < 3; i++ )
        for( var j = 0; j < 2; j++ )
        { var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0,    1,0,0 )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ),   0,1,0 ) )
                         .times( Mat4.translation( 0,0,1 ) );
                                  // Calling this function of a Square (or any Shape) copies it into the specified
                                  // Shape (this one) at the specified matrix offset (square_transform):
          Square.insert_transformed_copy_into( this, [], square_transform );
        }
    }
}


export { Triangle, Square, Cube, }