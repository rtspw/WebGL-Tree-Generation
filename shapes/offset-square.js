import { tiny } from '../tiny-graphics.js';
const { Shape, vec3 } = tiny;

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

export default OffsetSquare;