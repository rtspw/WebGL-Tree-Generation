import { tiny } from './tiny-graphics.js';

const {
  Shape, Vector, vec, vec3, Mat4, Vector3,
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

class Grid_Patch extends Shape       // A grid of rows and columns you can distort. A tesselation of triangles connects the
{                                           // points, generated with a certain predictable pattern of indices.  Two callbacks
                                            // allow you to dynamically define how to reach the next row or column.
  constructor( rows, columns, next_row_function, next_column_function, texture_coord_range = [ [ 0, rows ], [ 0, columns ] ]  )
    { super( "position", "normal", "texture_coord" );
      let points = [];
      for( let r = 0; r <= rows; r++ ) 
      { points.push( new Array( columns+1 ) );                                                    // Allocate a 2D array.
                                             // Use next_row_function to generate the start point of each row. Pass in the progress ratio,
        points[ r ][ 0 ] = next_row_function( r/rows, points[ r-1 ] && points[ r-1 ][ 0 ] );      // and the previous point if it existed.                                                                                                  
      }
      for(   let r = 0; r <= rows;    r++ )               // From those, use next_column function to generate the remaining points:
        for( let c = 0; c <= columns; c++ )
        { if( c > 0 ) points[r][ c ] = next_column_function( c/columns, points[r][ c-1 ], r/rows );
      
          this.arrays.position.push( points[r][ c ] );        
                                                                                      // Interpolate texture coords from a provided range.
          const a1 = c/columns, a2 = r/rows, x_range = texture_coord_range[0], y_range = texture_coord_range[1];
          this.arrays.texture_coord.push( vec( ( a1 )*x_range[1] + ( 1-a1 )*x_range[0], ( a2 )*y_range[1] + ( 1-a2 )*y_range[0] ) );
        }
      for(   let r = 0; r <= rows;    r++ )            // Generate normals by averaging the cross products of all defined neighbor pairs.
        for( let c = 0; c <= columns; c++ )
        { let curr = points[r][c], neighbors = new Array(4), normal = vec3( 0,0,0 );          
          for( let [ i, dir ] of [ [ -1,0 ], [ 0,1 ], [ 1,0 ], [ 0,-1 ] ].entries() )         // Store each neighbor by rotational order.
            neighbors[i] = points[ r + dir[1] ] && points[ r + dir[1] ][ c + dir[0] ];        // Leave "undefined" in the array wherever
                                                                                              // we hit a boundary.
          for( let i = 0; i < 4; i++ )                                          // Take cross-products of pairs of neighbors, proceeding
            if( neighbors[i] && neighbors[ (i+1)%4 ] )                          // a consistent rotational direction through the pairs:
              normal = normal.plus( neighbors[i].minus( curr ).cross( neighbors[ (i+1)%4 ].minus( curr ) ) );          
          normal.normalize();                                                              // Normalize the sum to get the average vector.
                                                     // Store the normal if it's valid (not NaN or zero length), otherwise use a default:
          if( normal.every( x => x == x ) && normal.norm() > .01 )  this.arrays.normal.push( normal.copy() );    
          else                                                      this.arrays.normal.push( vec3( 0,0,1 ) );
        }   
        
      for( var h = 0; h < rows; h++ )             // Generate a sequence like this (if #columns is 10):  
        for( var i = 0; i < 2 * columns; i++ )    // "1 11 0  11 1 12  2 12 1  12 2 13  3 13 2  13 3 14  4 14 3..." 
          for( var j = 0; j < 3; j++ )
            this.indices.push( h * ( columns + 1 ) + columns * ( ( i + ( j % 2 ) ) % 2 ) + ( ~~( ( j % 3 ) / 2 ) ? 
                                   ( ~~( i / 2 ) + 2 * ( i % 2 ) )  :  ( ~~( i / 2 ) + 1 ) ) );
    }
  static sample_array( array, ratio )                 // Optional but sometimes useful as a next row or column operation. In a given array
    {                                                 // of points, intepolate the pair of points that our progress ratio falls between.  
      const frac = ratio * ( array.length - 1 ), alpha = frac - Math.floor( frac );
      return array[ Math.floor( frac ) ].mix( array[ Math.ceil( frac ) ], alpha );
    }
}

class Subdivision_Sphere extends Shape   
{                       // **Subdivision_Sphere** defines a Sphere surface, with nice uniform triangles.  A subdivision surface
                        // (see Wikipedia article on those) is initially simple, then builds itself into a more and more 
                        // detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
                        // some desired mathematical surface by projecting each new point onto that surface's known 
                        // implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
                        // face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
                        // the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
                        // unit sphere) and group them into triangles by following the predictable pattern of the recursion.
  constructor( max_subdivisions )
    { super( "position", "normal", "texture_coord" );                          
                                                                        // Start from the following equilateral tetrahedron:
      const tetrahedron = [ [ 0, 0, -1 ], [ 0, .9428, .3333 ], [ -.8165, -.4714, .3333 ], [ .8165, -.4714, .3333 ] ];
      this.arrays.position = Vector3.cast( ...tetrahedron );
                                                                        // Begin recursion:
      this.subdivide_triangle( 0, 1, 2, max_subdivisions);
      this.subdivide_triangle( 3, 2, 1, max_subdivisions);
      this.subdivide_triangle( 1, 0, 3, max_subdivisions);
      this.subdivide_triangle( 0, 2, 3, max_subdivisions);
      
                                     // With positions calculated, fill in normals and texture_coords of the finished Sphere:
      for( let p of this.arrays.position )
        {                                    // Each point has a normal vector that simply goes to the point from the origin:
          this.arrays.normal.push( p.copy() );

                                         // Textures are tricky.  A Subdivision sphere has no straight seams to which image 
                                         // edges in UV space can be mapped.  The only way to avoid artifacts is to smoothly
                                         // wrap & unwrap the image in reverse - displaying the texture twice on the sphere.                                                        
        //  this.arrays.texture_coord.push( Vector.of( Math.asin( p[0]/Math.PI ) + .5, Math.asin( p[1]/Math.PI ) + .5 ) );
          this.arrays.texture_coord.push( Vector.of(
                0.5 - Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 + Math.asin(p[1]) / Math.PI) );
        }

                                                         // Fix the UV seam by duplicating vertices with offset UV:
      const tex = this.arrays.texture_coord;
      for (let i = 0; i < this.indices.length; i += 3) {
          const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
          if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
              && [a, b, c].some(x => tex[x][0] < 0.5))
          {
              for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                  if (tex[q[0]][0] < 0.5) {
                      this.indices[q[1]] = this.arrays.position.length;
                      this.arrays.position.push( this.arrays.position[q[0]].copy());
                      this.arrays.normal  .push( this.arrays.normal  [q[0]].copy());
                      tex.push(tex[q[0]].plus( vec(1, 0) ));
                  }
              }
          }
      }
    }
    subdivide_triangle( a, b, c, count )
    {                                           // subdivide_triangle(): Recurse through each level of detail 
                                                // by splitting triangle (a,b,c) into four smaller ones.
      if( count <= 0)
        {                                       // Base case of recursion - we've hit the finest level of detail we want.
          this.indices.push( a,b,c ); 
          return; 
        }
                                                // So we're not at the base case.  So, build 3 new vertices at midpoints,
                                                // and extrude them out to touch the unit sphere (length 1).
      var ab_vert = this.arrays.position[a].mix( this.arrays.position[b], 0.5).normalized(),     
          ac_vert = this.arrays.position[a].mix( this.arrays.position[c], 0.5).normalized(),
          bc_vert = this.arrays.position[b].mix( this.arrays.position[c], 0.5).normalized(); 
                                                // Here, push() returns the indices of the three new vertices (plus one).
      var ab = this.arrays.position.push( ab_vert ) - 1,
          ac = this.arrays.position.push( ac_vert ) - 1,  
          bc = this.arrays.position.push( bc_vert ) - 1;  
                               // Recurse on four smaller triangles, and we're done.  Skipping every fourth vertex index in 
                               // our list takes you down one level of detail, and so on, due to the way we're building it.
      this.subdivide_triangle( a, ab, ac,  count - 1 );
      this.subdivide_triangle( ab, b, bc,  count - 1 );
      this.subdivide_triangle( ac, bc, c,  count - 1 );
      this.subdivide_triangle( ab, bc, ac, count - 1 );
    }
  }

export { Triangle, Square, Cube, Grid_Patch, Subdivision_Sphere };