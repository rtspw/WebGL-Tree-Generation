import { tiny } from '../tiny-graphics.js';
const { Shape, vec, Vector, Vector3 } = tiny;

// **Subdivision_Sphere** defines a Sphere surface, with nice uniform triangles.  A subdivision surface
// (see Wikipedia article on those) is initially simple, then builds itself into a more and more 
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
// some desired mathematical surface by projecting each new point onto that surface's known 
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
class Subdivision_Sphere extends Shape {                       
  constructor( max_subdivisions ) { 
    super( "position", "normal", "texture_coord" );                          
    // Start from the following equilateral tetrahedron:
    const tetrahedron = [ [ 0, 0, -1 ], [ 0, .9428, .3333 ], [ -.8165, -.4714, .3333 ], [ .8165, -.4714, .3333 ] ];
    this.arrays.position = Vector3.cast( ...tetrahedron );

    // Begin recursion:
    this.subdivide_triangle( 0, 1, 2, max_subdivisions);
    this.subdivide_triangle( 3, 2, 1, max_subdivisions);
    this.subdivide_triangle( 1, 0, 3, max_subdivisions);
    this.subdivide_triangle( 0, 2, 3, max_subdivisions);
    
    // With positions calculated, fill in normals and texture_coords of the finished Sphere:
    for( let p of this.arrays.position ) {
      // Each point has a normal vector that simply goes to the point from the origin:
      this.arrays.normal.push( p.copy() );

      // Textures are tricky.  A Subdivision sphere has no straight seams to which image 
      // edges in UV space can be mapped.  The only way to avoid artifacts is to smoothly
      // wrap & unwrap the image in reverse - displaying the texture twice on the sphere.                                                        
      //  this.arrays.texture_coord.push( Vector.of( Math.asin( p[0]/Math.PI ) + .5, Math.asin( p[1]/Math.PI ) + .5 ) );
      this.arrays.texture_coord.push(Vector.of(0.5 - Math.atan2(p[2], p[0]) / (2 * Math.PI), 0.5 + Math.asin(p[1]) / Math.PI) );
    }

    // Fix the UV seam by duplicating vertices with offset UV:
    const tex = this.arrays.texture_coord;
    for (let i = 0; i < this.indices.length; i += 3) {
      const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
      if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
        && [a, b, c].some(x => tex[x][0] < 0.5)) {
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

  // subdivide_triangle(): Recurse through each level of detail 
  // by splitting triangle (a,b,c) into four smaller ones.
  subdivide_triangle( a, b, c, count ) {  

    // Base case of recursion - we've hit the finest level of detail we want.                               
    if( count <= 0) {
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

export default Subdivision_Sphere;