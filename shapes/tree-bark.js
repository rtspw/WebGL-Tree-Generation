import { tiny } from '../tiny-graphics.js';
const { Shape, Vector3, vec3 } = tiny;


class TreeBark extends Shape {                                 
  constructor(topRatio = 0.5) { 
    super("position", "normal");                           
    this.arrays.position = Vector3.cast(
      [-1,0,0], [-.55,0,1], vec3(...[-1,1,0]).mix(vec3(0,1,0), topRatio),
      [-.55,0,1], vec3(...[-.55,1,1]).mix(vec3(0,1,0), topRatio), vec3(...[-1,1,0]).mix(vec3(0,1,0), topRatio),
      [-.55,0,1], [.55,0,1], vec3(...[-.55,1,1]).mix(vec3(0,1,0), topRatio),
      [.55,0,1], vec3(...[.55,1,1]).mix(vec3(0,1,0), topRatio), vec3(...[-.55,1,1]).mix(vec3(0,1,0), topRatio),
      [.55,0,1], [1,0,0], vec3(...[.55,1,1]).mix(vec3(0,1,0), topRatio),
      [1,0,0], vec3(...[1,1,0]).mix(vec3(0,1,0), topRatio), vec3(...[.55,1,1]).mix(vec3(0,1,0), topRatio),
      [1,0,0], [.55,0,-1], vec3(...[1,1,0]).mix(vec3(0,1,0), topRatio),
      [.55,0,-1], vec3(...[.55,1,-1]).mix(vec3(0,1,0), topRatio), vec3(...[1,1,0]).mix(vec3(0,1,0), topRatio),
      [.55,0,-1], [-.55,0,-1], vec3(...[.55,1,-1]).mix(vec3(0,1,0), topRatio),
      [-.55,0,-1], vec3(...[-.55,1,-1]).mix(vec3(0,1,0), topRatio), vec3(...[.55,1,-1]).mix(vec3(0,1,0), topRatio),
      [-.55,0,-1], [-1,0,0], vec3(...[-.55,1,-1]).mix(vec3(0,1,0), topRatio),
      [-1,0,0], vec3(...[-1,1,0]).mix(vec3(0,1,0), topRatio), vec3(...[-.55,1,-1]).mix(vec3(0,1,0), topRatio),
    );
    this.arrays.normal = Vector3.cast(
      [-.8,0,.45], [-.8,0,.45], [-.8,0,.45],
      [-.8,0,.45], [-.8,0,.45], [-.8,0,.45],
      [0,0,1], [0,0,1], [0,0,1],
      [0,0,1], [0,0,1], [0,0,1],
      [.8,0,.45], [.8,0,.45], [.8,0,.45],
      [.8,0,.45], [.8,0,.45], [.8,0,.45],
      [.8,0,-.45], [.8,0,-.45], [.8,0,-.45],
      [.8,0,-.45], [.8,0,-.45], [.8,0,-.45],
      [0,0,-1], [0,0,-1], [0,0,-1],
      [0,0,-1], [0,0,-1], [0,0,-1],
      [-.8,0,-.45], [-.8,0,-.45], [-.8,0,-.45],
      [-.8,0,-.45], [-.8,0,-.45], [-.8,0,-.45],
    );
    console.log(this.arrays.normal)
  }
}

export default TreeBark;