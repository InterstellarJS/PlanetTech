


export const project=( normalizedCenter, r, center,p )=>{
    normalizedCenter.sub(p).normalize()
    center.copy(normalizedCenter)
    normalizedCenter.multiplyScalar(r)
    normalizedCenter.add(p).add(center)
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


 export const isWithinBounds = (distance, primitive,size) => {
   return ( (distance) < (primitive.quadTreeController.config.lodDistanceOffset * size) && size > primitive.quadTreeController.config.minLevelSize )
  };
