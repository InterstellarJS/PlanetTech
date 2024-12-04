import * as THREE from 'three/tsl'
import { QuadTreeLODCore,QuadTreeLOD } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'
import { ThreadController } from './webWorker/threading.js'
import { workersSRC } from './webWorker/workerThread.js'


class Node extends THREE.Object3D{ constructor(params){ super(); this.params = params } }

const defualtCallBack = q => {}

export class Quad extends THREE.Object3D{

  constructor({ size, resolution, dimension }){
    super()

    this.parameters = {
      size: size,
      resolution: resolution,
      dimension:  dimension
    }

    this.metaData  = {}
    this.nodes = {}
    this.neighbors = new Set()
    this.quadTreeconfig = new QuadTreeLODCore()
  }

  createQuadTree({ levels }){
    Object.assign(this.quadTreeconfig.config,{
      maxLevelSize:  this.parameters.size,
      minLevelSize:  Math.floor(this.parameters.size/Math.pow(2,levels-1)), // this create a vizual bug in the lower levels when size not a power of 2 
      minPolyCount:  this.parameters.resolution,
      dimensions:    this.parameters.dimension,
      }
    )
    this.quadTreeconfig.levels(levels)
    this.quadTreeconfig.createArrayBuffers()
    this.quadTree = new QuadTreeLOD()
  }  

  addNode(node){
    this.nodes[[node.uuid]] = node
  }

  thread(){
    this.threading = true
  }

  createPlane({ material, size, resolution, matrixRotationData, offset, shardedData, node, callBack }){

    if(this.threading){
       
      const sharedArrayUv       = new SharedArrayBuffer(shardedData.geometryData.byteLengthUv       ); 
      const sharedArrayIndex    = new SharedArrayBuffer(shardedData.geometryData.byteLengthIndex    );
      const sharedArrayPosition = new SharedArrayBuffer(shardedData.geometryData.byteLengthPosition ); 
      const sharedArrayNormal   = new SharedArrayBuffer(shardedData.geometryData.byteLengthNormal   );
 
      const positionBuffer      = new Float32Array(sharedArrayPosition );
      const normalBuffer        = new Float32Array(sharedArrayNormal   );
      const uvBuffer            = new Float32Array(sharedArrayUv       );
      const indexBuffer         = new Uint32Array (sharedArrayIndex    );
 
      let blob       = new Blob([workersSRC(QuadGeometry.name,[ QuadGeometry ])], {type: 'application/javascript'}); 
      let threadController = new ThreadController(new Worker(URL.createObjectURL(blob),{ type: "module" }));

      threadController.setPayload({
        sharedArrayPosition,
        sharedArrayNormal,
        sharedArrayIndex,
        sharedArrayUv,
        matrixRotationData,
        offset,
        size,
        resolution,
       });

      let promise = new Promise((resolve)=>{
        threadController.getPayload((payload)=>{

          let buffers = {
            positionBuffer,
            normalBuffer,
            uvBuffer,
            indexBuffer,
          }
  
          let geometry = new QuadGeometry( size, size, resolution, resolution )
          geometry.setIndex(  Array.from(buffers.indexBuffer)  );
          geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( buffers.positionBuffer , 3 ) );
          geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute(  buffers.normalBuffer , 3 ) );
          geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute(  buffers.uvBuffer , 2 ) );
  
          node.plane = new THREE.Mesh(geometry, material)

          callBack(node)

          this.add(node.plane)
          
          resolve(node)
        })
      })

      promise.uuid = node.uuid

      return promise

    }else{

      let matrix  = matrixRotationData.propMehtod ? new THREE.Matrix4()[[matrixRotationData.propMehtod]](matrixRotationData.input) : new THREE.Matrix4() 

      let geometry = new QuadGeometry( size, size, resolution, resolution )

      geometry._setMatrix({ matrix })

      geometry._setOffset({ offset })

      geometry._build()

      node.plane = new THREE.Mesh(geometry, material)

      callBack(node)

      this.add(q.plane)

      return node
    }
  }

  createNewNode({ shardedData, matrixRotationData, offset, index, direction, callBack }){

    const size  = shardedData.geometryData.parameters.width
    const segments  = shardedData.geometryData.parameters.widthSegments

    let material = this.quadTreeconfig.config.material

    let metaData = {   
      index,  
      offset,  
      direction
    }

    let node = new Node( {size, segments, metaData} )

    node = this.createPlane({
      material:material,
      size:size,
      resolution:segments,
      matrixRotationData: matrixRotationData,
      offset:offset,
      shardedData,
      node,
      callBack,
    })

    this.addNode(node)

    return node
  }

  createDimensions(callBack = defualtCallBack ){
    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeconfig.config.arrybuffers[w]

    for (var i = 0; i < d; i++) {
      var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
      for (var j = 0; j < d; j++) {
        var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
        let _index = i * d + j;
        let node = this.createNewNode({
          shardedData: shardedData,
          matrixRotationData: {propMehtod:'',input:undefined},
          offset: [i_,-j_,k],
          index:_index,
          direction:'+z',
          callBack:callBack
        })
      }
    }
  }

}




export class Cube extends Quad {

  constructor({ size, resolution, dimension}){
    super({ size, resolution, dimension }) 
  }

  createDimensions( callBack = defualtCallBack ){

    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeconfig.config.arrybuffers[w]

    for (var i = 0; i < d; i++) {
      var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
      for (var j = 0; j < d; j++) {
        var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
        let _index = i * d + j;

         this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData: {propMehtod:'',input:0}, 
          offset: [i_,-j_,k],
          index:_index,
          direction:'+z',
          callBack
        })
 
         this.createNewNode({ 
          shardedData: shardedData,
          matrixRotationData:{propMehtod:'makeRotationY',input:Math.PI }, 
          offset:  [i_,-j_,-k],
          index: _index,
          direction:'-z',
          callBack   
        })
 
         this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationY',input:Math.PI/2 }, 
          offset: [k,-j_,-i_],
          index: _index,
          direction:'+x',
          callBack      
        })
 
        this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationY',input:-Math.PI/2 }, 
          offset: [-k,-j_,-i_],
          index: _index,
          direction:'-x',
          callBack   
        })
 
        this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationX',input:-Math.PI/2 }, 
          offset: [i_,k,j_],
          index: _index,
          direction:'+y',
          callBack       
        })

        this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationX',input:Math.PI/2 },  
          offset: [i_,-k,j_],
          index: _index,
          direction:'-y',
          callBack      
        })
      }
    }
  }

}


export class Sphere extends Cube{

  constructor({ size, resolution, dimension, radius }){
    super({size, resolution, dimension})
    this.quadTreeconfig.config.radius = radius
  }

  createPlane({ material, size, resolution, matrixRotationData, offset, shardedData, node, callBack }){

    if(this.threading){
       
      const sharedArrayUv       = new SharedArrayBuffer(shardedData.geometryData.byteLengthUv       ); 
      const sharedArrayIndex    = new SharedArrayBuffer(shardedData.geometryData.byteLengthIndex    );
      const sharedArrayPosition = new SharedArrayBuffer(shardedData.geometryData.byteLengthPosition ); 
      const sharedArrayNormal   = new SharedArrayBuffer(shardedData.geometryData.byteLengthNormal   );
      const sharedArrayDirVect  = new SharedArrayBuffer(shardedData.geometryData.byteLengthNormal   );

      const positionBuffer      = new Float32Array(sharedArrayPosition );
      const normalBuffer        = new Float32Array(sharedArrayNormal   );
      const uvBuffer            = new Float32Array(sharedArrayUv       );
      const indexBuffer         = new Uint32Array (sharedArrayIndex    );
      const dirVectBuffer       = new Float32Array(sharedArrayDirVect  );

      let blob       = new Blob([workersSRC(NormalizedQuadGeometry.name,[QuadGeometry, NormalizedQuadGeometry ])], {type: 'application/javascript'}); 
      let threadController = new ThreadController(new Worker(URL.createObjectURL(blob),{ type: "module" }));

      threadController.setPayload({
        sharedArrayPosition,
        sharedArrayNormal,
        sharedArrayIndex,
        sharedArrayUv,
        sharedArrayDirVect,
        matrixRotationData,
        offset,
        size,
        resolution,
        radius:this.quadTreeconfig.config.radius,
      });
      
    let promise = new Promise((resolve)=>{

      threadController.getPayload(( payload )=>{

          let buffers = {
            positionBuffer,
            normalBuffer,
            uvBuffer,
            indexBuffer,
            dirVectBuffer
          }

          let geometry = new NormalizedQuadGeometry( size, size, resolution, resolution, this.quadTreeconfig.config.radius)

          geometry.setIndex(  Array.from(buffers.indexBuffer)  );
          geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( buffers.positionBuffer , 3 ) );
          geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute(  buffers.normalBuffer , 3 ) );
          geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute(  buffers.uvBuffer , 2 ) );
          geometry.setAttribute( 'directionVectors', new THREE.Float32BufferAttribute( buffers.dirVectBuffer, 3 ) );

          node.plane = new THREE.Mesh(geometry, material)

          callBack(node)

          this.add(node.plane)
          
          resolve(node)
        })

      })

      promise.uuid = node.uuid

      return promise

    }else{

      let matrix  = matrixRotationData.propMehtod ? new THREE.Matrix4()[[matrixRotationData.propMehtod]](matrixRotationData.input) : new THREE.Matrix4() 

      let geometry = new NormalizedQuadGeometry( size, size, resolution, resolution, this.quadTreeconfig.config.radius)

      geometry._setMatrix({ matrix })

      geometry._setOffset({ offset })

      geometry._build()

      node.plane = new THREE.Mesh(geometry, material)
      
      callBack(node)

      this.add(node.plane)

      return node

    }
  }
}
