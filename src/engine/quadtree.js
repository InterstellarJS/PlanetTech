import * as THREE  from 'three/tsl';


const setChildren = ( primative, node ) =>{

  let parent    = node
  let direction = node.params.metaData.direction
  let offset    = node.params.metaData.offset
  let size      = node.params.size
  let key       =  size/2
  let shardedData = primative.quadTreeController.config.arrybuffers[key]
  let matrixRotationData = node.params.metaData.matrixRotationData
  
  let callBack  = (_node)=>{
    _node.plane().material = new THREE.MeshBasicNodeMaterial({color:new THREE.Color(Math.random(),Math.random(),Math.random())})
    _node.plane().occlusionTest = true;
  }
  
  if ( direction.includes('z')){

    let locations = [
    [(size/4)+offset[0],(size/4)+offset[1],offset[2]],
    [(-size/4)+offset[0],(size/4)+offset[1],offset[2]],
    [(size/4)+offset[0],(-size/4)+offset[1],offset[2]],
    [(-size/4)+offset[0],(-size/4)+offset[1],offset[2]]]

    locations.map( location =>{
      primative.createNewNode({
      shardedData,
      direction,
      matrixRotationData,
      offset:location,
      index:null,
      callBack,
      parent
          }
        )
      })
      parent.plane().material.visible = false
    }
 
  else if (direction.includes('x')){
   
    let locations = [
    [offset[0],(size/4)+offset[1],(size/4)+offset[2]],
    [offset[0],(size/4)+offset[1],(-size/4)+offset[2]],
    [offset[0],(-size/4)+offset[1],(size/4)+offset[2]],
    [offset[0],(-size/4)+offset[1],(-size/4)+offset[2]]]

    locations.map( location =>{
      primative.createNewNode({
      shardedData,
      direction,
      matrixRotationData,
      offset:location,
      index:null,
      callBack,
      parent
          }
        )
      })
      parent.plane().material.visible = false
   }  
    
  else if (direction.includes('y')){
    
    let locations =  [
    [(size/4)+offset[0],offset[1],(size/4)+offset[2]],
    [(-size/4)+offset[0],offset[1],(size/4)+offset[2]],
    [(size/4)+offset[0],offset[1],(-size/4)+offset[2]],
    [(-size/4)+offset[0],offset[1],(-size/4)+offset[2]]]

    locations.map( location =>{
      primative.createNewNode({
      shardedData,
      direction,
      matrixRotationData,
      offset:location,
      index:null,
      callBack,
      parent
          }
        )
      })
      parent.plane().material.visible = false
   }
 
}

export class QuadTreeController {

  constructor(config = {}) {
    let shardedData = {
      maxLevelSize:1,
      minLevelSize:1,
      minPolyCount:1,
      maxPolyCount:undefined,
      dimensions:1,
      arrybuffers:{},
      scale: 1,
      lodDistanceOffset: 1,
      displacmentScale:1,
      material: new THREE.MeshBasicNodeMaterial({ color: "grey" }),
    }
    this.config = Object.assign( shardedData, config )
  }

  levels(numOflvls) {
    var levelsArray  = [];
    var polyPerLevel = [];
    var value        = this.config.maxLevelSize
    var min          = this.config.minLevelSize
    var minPoly      = this.config.minPolyCount
    for (let i = 0; i < numOflvls; i++) {
        levelsArray .push( value   )
        polyPerLevel.push( minPoly )
        value   = Math.floor( value / 2   )
        minPoly = Math.floor( minPoly * 2 )
    }
    this.config['levels'] = {numOflvls,levelsArray,polyPerLevel}
    this.config['maxPolyCount'] = polyPerLevel[polyPerLevel.length - 1]
  }

  createArrayBuffers(){
    for ( var i = 0; i < this.config.levels.numOflvls;  i++ ) {
      const size  = this.config.levels.levelsArray [i]
      const poly  = this.config.levels.polyPerLevel[i]
      this.config.arrybuffers[size] = {
        geometryData:{
          parameters: {
            width: size,
            height:size,
            widthSegments: poly,
            heightSegments:poly
          },
          byteLengthUv:       (poly+1) * (poly+1) * 2 * 4,
          byteLengthPosition: (poly+1) * (poly+1) * 3 * 4,
          byteLengthNormal:   (poly+1) * (poly+1) * 3 * 4,
          byteLengthIndex:    poly * poly * 6 * 4,
        }
      }
    }
  }

}


export class QuadTree {

  constructor(){} 

  insert(primative,node){
    this.split(primative,node)
  }

  split(primative,node){
    setChildren ( primative, node )
   
    }
  }