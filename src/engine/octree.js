import {Octree} from '@interstellar-js-core/octree'

export class QuadOctree extends Octree{
    constructor(worldObjects, minNodeSize, register){
        super(worldObjects, minNodeSize, register)
    }
}

export function findNeighbors( currentObj, objs ){
    currentObj.plane.octreeCells.forEach(( cell )=>{ 
      cell.objID.forEach((id)=>{
        if(currentObj.plane != objs[id].plane) 
          if((currentObj.plane.geometry.boundingBox.intersectsBox(objs[id].plane.geometry.boundingBox) )){  
            currentObj.neighbors.add(objs[id].plane.uuid)  
          }
        })
      })
   }