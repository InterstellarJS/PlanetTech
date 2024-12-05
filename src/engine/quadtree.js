import * as THREE  from 'three/tsl';

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
    if ( node.params.metaData.direction == '+z'){
    console.log(node.params )
    //console.log(primative,primative.quadTreeController)
    //shardedData, matrixRotationData, offset, index, direction, callBack, parent = this
    let parent  = node
    //parent.material.visible = false


    console.log(node.params.metaData.offset)
    let size = node.params.size
    let key  =  size/2 
 
 
    let direction = node.params.metaData.direction
 
    let matrixRotationData = node.params.metaData.matrixRotationData
    let offset = [-25/2,25/2,25]
    let index = 0
    let shardedData = primative.quadTreeController.config.arrybuffers[key]
    let callBack = (_node)=>{

      _node.plane.material = new THREE.MeshBasicNodeMaterial({color:new THREE.Color(Math.random(),Math.random(),Math.random())})
      _node.plane.occlusionTest = true;
console.log(_node.plane.position)


const geometry = new THREE.SphereGeometry( 2, 32, 16 ); 
const material = new THREE.MeshBasicMaterial( { color: 'black' } ); 
const sphere = new THREE.Mesh( geometry, material ); 
_node.plane.add(sphere)
    }
 
    let n1 = primative.createNewNode({
      shardedData,
      direction,
      matrixRotationData,
      offset:offset,
      index,
      callBack,
      parent
    })
    //let n2 = primative.createNewNode()
    //let n3 = primative.createNewNode()
    //let n4 = primative.createNewNode()
    }
   
    }
  }