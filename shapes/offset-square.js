import { tiny } from '../tiny-graphics.js';
const { Shape, vec3 } = tiny;

/**
 * options: Object
 * |-columnDivisions: number - Greater than 0
 * |-rowDivisions: number - Greater than 0
 * |-bumpiness: number - Between 0 and 1
 * |   Vertex offsets normal to flat square shape
 * |-colNoiseFactor: number - Between 0 and 1
 * |   Randomness in location of column vertices
 * |-rowNoiseFactor: number - Between 0 and 1
 * |   Randomness in location of row vertices
 */
class OffsetSquare extends Shape {
  constructor(options = {}) {
    const {
      columnDivisions = 6,
      rowDivisions = 6,
      bumpiness = 1,
      colNoiseFactor = 0.5,
      rowNoiseFactor = 0.5,
    } = options;
    super( "position", "normal");
    const columnDivisionIndices = this.subdivideNegOneToOne(columnDivisions)
    const rowDivisionIndicies = this.subdivideNegOneToOne(rowDivisions);
    const vertexRows = rowDivisionIndicies
      .reverse()
      .map((rowIndex) => {
        return columnDivisionIndices.map(colIndex => {
          const colNoise = colIndex === 1 || colIndex === -1 ? 0 : this.generateNoise(columnDivisions, colNoiseFactor);
          const rowNoise = rowIndex === 1 || rowIndex === -1 ? 0 : this.generateNoise(rowDivisions, rowNoiseFactor);
          return [colIndex + colNoise, rowIndex + rowNoise, Math.random() * bumpiness];
        })
      });
    const verticies = [];
    const normals = [];
    for (let i = 0; i < columnDivisions; i++) {
      for (let j = 0; j < rowDivisions; j++) {
        verticies.push(vec3(...vertexRows[j][i+1]), vec3(...vertexRows[j][i]), vec3(...vertexRows[j+1][i]));
        const firstNormal = this.getNormalFromTopOfVertexList(verticies);
        normals.push(firstNormal, firstNormal, firstNormal);
        verticies.push(vec3(...vertexRows[j+1][i]), vec3(...vertexRows[j+1][i+1]), vec3(...vertexRows[j][i+1]));
        const secondNormal = this.getNormalFromTopOfVertexList(verticies);
        normals.push(secondNormal, secondNormal, secondNormal);
      }
    }
    this.arrays.position = verticies;
    this.arrays.normal = normals;
  }

  generateNoise(numOfDivisions, noiseFactor) {
    return (((1 / numOfDivisions) * 2 * Math.random() - (1 / numOfDivisions))) * noiseFactor;
  }

  subdivideNegOneToOne(numOfDivisions) {
    const divisions = [...Array(numOfDivisions)].map((_, i) => ((2/numOfDivisions) * i) - 1);
    divisions.push(1);
    return divisions;
  }

  getNormalFromTopOfVertexList(verticies) {
    const firstVector = verticies[verticies.length - 3].minus(verticies[verticies.length - 2]);
    const secondVector = verticies[verticies.length - 2].minus(verticies[verticies.length - 1]);
    const normal = firstVector.cross(secondVector).normalized();
    return normal;
  }
}

export default OffsetSquare;