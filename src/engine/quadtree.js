import * as THREE  from 'three/tsl';
import { MeshNode } from './nodes.js';
 
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
        value   =( value / 2   )
        minPoly = ( minPoly * 2 )
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

  constructor(){
    this.rootNodes  = []
  } 
 
  update(OBJECT3D,primitive){
    this.rootNodes.forEach(quadtreeNode=>{
      quadtreeNode.insert(OBJECT3D,primitive)
      let visibleNodes = quadtreeNode.visibleNodes(OBJECT3D,primitive)

      const visibleMeshNodes = new Set();

       for (const node of visibleNodes) {
        const key = `${node.bounds.x}_${node.bounds.y}_${node.params.size}`;
        if (primitive.nodes.has(key)) {
          const meshNode = primitive.nodes.get(key);
          meshNode.showMesh();
          visibleMeshNodes.add(key);
        } else {
          const size     = node.params.size 
          const segments = node.params.segments
          const metaData = node.params.metaData
          const offset   = node.params.metaData.offset 
          const matrixRotationData = node.params.metaData.matrixRotationData
          const shardedData = primitive.quadTreeController.config.arrybuffers[size];
          let meshNode    = new MeshNode( {size, segments, metaData}, 'active' )


          meshNode = primitive.createPlane({
            material:new THREE.MeshBasicMaterial({color:new THREE.Color(
              Math.random(),
              Math.random(),
              Math.random())}),
            size:size,
            resolution:segments,
            matrixRotationData: matrixRotationData,
            offset:offset,
            shardedData,
            node:meshNode,
            callBack:()=>{},
            parent:primitive
          })
          let boundsStr =  `${node.bounds.x}_${node.bounds.y}_${node.params.size}`
          primitive.addNode(boundsStr,meshNode)
         // const newChunk = this.createChunk(
           // { x: node.bounds.x, y: node.bounds.y },
           // node.bounds.size
         // );
         // this.chunks.set(key, newChunk);
         // visibleChunks.add(key);
        }

       }

    })
  }

  split(OBJECT3D,primitive,node){
    
    }
  }