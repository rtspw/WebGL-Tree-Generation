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
 *    branchLengthLowerBoundFactor: What fraction of the upper bound the lower bound should be
 *    cutoffThreshold: Stop recursively creating branches when length has decayed to certain number
 *    leafThreshold: Below what size should there start being leaves
 *    lengthDecayRate: Determines the length of the chilren branches for each recursive call
 *    radiusDecayRate: Determines fraction of radius each recursive call should use
 *    minSplitAngle: Upper bound for angle from direction vector new branches should split
 *    maxSplitAngle: Lower bound for angle from direction vector new branches should split
 */
class TreeGenerator {
  constructor(parameters = {}) {
    const {
      initialDirectionVector = vec3(0, 1, 0),
      baseLength = 6,
      baseRadius = 1,
      cutoffThreshold = 1,
      leafThreshold = 3,
      lengthDecayRate = 0.9,
      radiusDecayRate = 0.5,
      minSplitAngle = Math.PI / 6,
      maxSplitAngle = Math.PI / 3,
      branchLengthLowerBoundFactor = 0.75,
      extraTrunkLength = 4,
    } = parameters;
    Object.assign(this, {
      initialDirectionVector,
      baseLength,
      baseRadius,
      cutoffThreshold,
      leafThreshold,
      lengthDecayRate,
      radiusDecayRate,
      minSplitAngle,
      maxSplitAngle,
      branchLengthLowerBoundFactor,
      extraTrunkLength,
    });
  }

  updateParameters(parameters = {}) {
    Object.assign(this, parameters);
  }

  generateTree() {
    this.branches = [];
    this.leafPositions = [];
    const rootPosition = vec3(0, 0, 0);
    const trunkLength = uniformRV(this.baseLength * this.branchLengthLowerBoundFactor, this.baseLength);
    const trunk = new Branch(rootPosition, this.initialDirectionVector, trunkLength + this.extraTrunkLength, this.baseRadius);
    this.branches.push(trunk);
    const endPoint = rootPosition.plus(this.initialDirectionVector.times(trunkLength + this.extraTrunkLength));
    this.__createBranches(endPoint, this.initialDirectionVector, trunkLength * this.lengthDecayRate, this.baseRadius * this.radiusDecayRate)
    return {
      branches: this.branches,
      leaves: this.leafPositions,
    };
  }

  /**
   * Creates two new branches and adds to branches array. Runs recursively with smaller length parameters
   * until cutoff threshold for the length is reached.
   * @param {vec3} startPos - Position to place branch at
   * @param {vec3} directionVector - Direction of the branch from the start position
   * @param {Number} branchLength - Upper bound on length of the branches
   * @param {Number} branchRadius - Upper bound on the radius of the branches
   */
  __createBranches(startPos, directionVector, branchLength, branchRadius) {
    if (branchLength < this.cutoffThreshold) {
      this.leafPositions.push(startPos);
      return;
    }
    if (branchLength < this.leafThreshold) {
      this.leafPositions.push(startPos);
    }
    const normalAxis = getRandomOrthogonalVector(directionVector).times(Math.random());
    const branchVector1 = Mat4.rotation(uniformRV(this.minSplitAngle, this.maxSplitAngle), ...normalAxis).times(directionVector).to3().normalized();
    const branchVector2 = Mat4.rotation(uniformRV(-this.maxSplitAngle, -this.minSplitAngle), ...normalAxis).times(directionVector).to3().normalized();
    const length1 = uniformRV(branchLength * this.branchLengthLowerBoundFactor, branchLength);
    const length2 = uniformRV(branchLength * this.branchLengthLowerBoundFactor, branchLength);
    this.branches.push(new Branch(startPos, branchVector1, length1, branchRadius))
    this.branches.push(new Branch(startPos, branchVector2, length2, branchRadius))
    const endPoint1 = startPos.plus(branchVector1.times(length1));
    const endPoint2 = startPos.plus(branchVector2.times(length2));
    this.__createBranches(endPoint1, branchVector1, length1 * this.lengthDecayRate, branchRadius * this.radiusDecayRate);
    this.__createBranches(endPoint2, branchVector2, length2 * this.lengthDecayRate, branchRadius * this.radiusDecayRate);
  }
}

export default TreeGenerator;
