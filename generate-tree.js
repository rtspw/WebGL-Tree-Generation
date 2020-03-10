//const tiny = require('./tiny-graphics-copy.js');
import { tiny } from './tiny-graphics.js';

const {
  vec3, Mat4,
} = tiny;

function Branch(rootPosition, directionVector, height, radius) {
  this.rootPosition = rootPosition;
  this.directionVector = directionVector;
  this.height = height;
  this.radius = radius; 
}

function uniformRV(start, end) {
  return start + Math.random() * (end - start);
}

function getRandomOrthogonalVector(inputVector) {
  const randomVector = vec3(Math.random(), Math.random(), Math.random());
  return inputVector.cross(randomVector).normalized();
}

/**
 * @param {Object} parameters
 *    initialDirectionVector: Direction it initially builds off. Starts from origin for starting position
 *    baseLength: Upper bound for length of trunk
 *    baseRadius: Upper boud for radius of trunk
 *    cutoffThreshold: Stop recursively creating branches when length has decayed to certain number
 *    lengthDecayRate: Determines the length of the chilren branches for each recursive call
 *    minSplitAngle: Upper bound for angle from direction vector new branches should split
 *    maxSplitAngle: Lower bound for angle from direction vector new branches should split
 */
class TreeGenerator {
  constructor(parameters = {}) {
    Object.assign(this, parameters);
  }

  updateParameters(parameters = {}) {
    Object.assign(this, parameters);
  }

  generateTree() {
    const branches = [];
    const rootPosition = vec3(0, 0, 0);
    const trunk = new Branch(rootPosition, this.initialDirectionVector, this.baseLength, this.baseRadius);
    branches.push(trunk);
    const endPoint = rootPosition.plus(this.initialDirectionVector.times(this.baseLength));
    this.__createBranches(branches, endPoint, this.initialDirectionVector, this.baseLength * this.lengthDecayRate, this.baseRadius * this.lengthDecayRate)
    return branches;
  }

  /**
   * Creates two new branches and adds to branches array. Runs recursively with smaller length parameters
   * until cutoff threshold for the length is reached.
   * @param {Array} branches - Array holding all the branch objects
   * @param {vec3} startPos - Position to place branch at
   * @param {vec3} directionVector - Direction of the branch from the start position
   * @param {Number} branchLength - Upper bound on length of the branches
   * @param {Number} branchRadius - Upper bound on the radius of the branches
   */
  __createBranches(branches, startPos, directionVector, branchLength, branchRadius) {
    if (branchLength < this.cutoffThreshold) return;
    const normalAxis = getRandomOrthogonalVector(directionVector).times(Math.random());
    const branchVector1 = Mat4.rotation(uniformRV(this.minSplitAngle, this.maxSplitAngle), ...normalAxis).times(directionVector).to3().normalized();
    const branchVector2 = Mat4.rotation(uniformRV(-this.maxSplitAngle, -this.minSplitAngle), ...normalAxis).times(directionVector).to3().normalized();
    const length1 = uniformRV(branchLength * 0.5, branchLength);
    const length2 = uniformRV(branchLength * 0.5, branchLength);
    branches.push(new Branch(startPos, branchVector1, length1, branchRadius))
    branches.push(new Branch(startPos, branchVector2, length2, branchRadius))
    const endPoint1 = startPos.plus(branchVector1.times(length1));
    const endPoint2 = startPos.plus(branchVector2.times(length2));
    this.__createBranches(branches, endPoint1, branchVector1, length1 * this.lengthDecayRate, branchRadius / 2);
    this.__createBranches(branches, endPoint2, branchVector2, length2 * this.lengthDecayRate, branchRadius / 2);
  }
}

export default TreeGenerator;
