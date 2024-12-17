 import * as THREE from 'three/tsl'

export const project=( normalizedCenter, radius, center )=>{
    let W = new THREE.Vector3()
    normalizedCenter.sub(center).normalize()
    W.copy(normalizedCenter)
    normalizedCenter.multiplyScalar(radius)
    normalizedCenter.add(center).add(W)
}

export const createLocations = ( size, offset, axis ) => {
    const halfSize = size 
    switch (axis) {
     case 'z':
       return [
         [ halfSize + offset[0],  halfSize + offset[1], offset[2]],
         [-halfSize + offset[0],  halfSize + offset[1], offset[2]],
         [ halfSize + offset[0], -halfSize + offset[1], offset[2]],
         [-halfSize + offset[0], -halfSize + offset[1], offset[2]],
       ];
     case 'x':
       return [
         [offset[0],  halfSize + offset[1],  halfSize + offset[2]],
         [offset[0],  halfSize + offset[1], -halfSize + offset[2]],
         [offset[0], -halfSize + offset[1],  halfSize + offset[2]],
         [offset[0], -halfSize + offset[1], -halfSize + offset[2]],
       ];
     case 'y':
       return [
         [ halfSize + offset[0], offset[1],  halfSize + offset[2]],
         [-halfSize + offset[0], offset[1],  halfSize + offset[2]],
         [ halfSize + offset[0], offset[1], -halfSize + offset[2]],
         [-halfSize + offset[0], offset[1], -halfSize + offset[2]],
       ];
     default:
       return [];
   }
 };
 
 export const cordinate = (idx) => ['NE','NW','SE','SW'][idx]

 export const isWithinBounds = (distance, primitive,size) => {
   return ( (distance) < (primitive.quadTreeController.config.lodDistanceOffset * size) && size > primitive.quadTreeController.config.minLevelSize )
  };

export const generateKey = node => `${node.params.index}_${node.params.direction}_${node.bounds.x}_${node.bounds.y}_${node.params.size}`