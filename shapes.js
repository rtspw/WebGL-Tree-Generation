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

class OffsetSquare extends Shape {
  constructor(divisions = 6, bumpiness = 1) { 
    super( "position", "normal");
    const dividedSquare = [...Array(divisions)].map((x, i) => ((2/divisions) * i) - 1);
    dividedSquare.push(1);
    const topVerticies = dividedSquare.map(x => [x,1,Math.random() * bumpiness]);
    const bottomVerticies = dividedSquare.map(x => [x,-1,Math.random() * bumpiness]);
    const verticies = [];
    const normals = [];
    for (let i = 0; i < topVerticies.length - 1; i++) {
      verticies.push(vec3(...topVerticies[i + 1]), vec3(...topVerticies[i]), vec3(...bottomVerticies[i]));
      const firstNormal = this.getNormalFromTopOfVertexList(verticies);
      normals.push(firstNormal, firstNormal, firstNormal);
      verticies.push(vec3(...bottomVerticies[i]), vec3(...bottomVerticies[i + 1]), vec3(...topVerticies[i + 1]));
      const secondNormal = this.getNormalFromTopOfVertexList(verticies);
      normals.push(secondNormal, secondNormal, secondNormal);
    }
    this.arrays.position = verticies;
    this.arrays.normal = normals;
  }

  getNormalFromTopOfVertexList(verticies) {
    const firstVector = verticies[verticies.length - 3].minus(verticies[verticies.length - 2]);
    const secondVector = verticies[verticies.length - 2].minus(verticies[verticies.length - 1]);
    const normal = firstVector.cross(secondVector).normalized();
    return normal;
  }
}



export { Triangle, Square, Cube, OffsetSquare, Subdivision_Sphere };