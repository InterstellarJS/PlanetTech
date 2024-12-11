import * as THREE from 'three/tsl'
import { QuadTreeController,QuadTree,QuadTreeNode } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'
import { ThreadController } from './webWorker/threading.js'
import { workersSRC } from './webWorker/workerThread.js'


class Node extends THREE.Object3D{ 

  constructor(params){ 
    super(); 
    this.params = params
    this.neighbors = new Set()
  }
  
  plane(){
    if (this.children[0] instanceof THREE.Mesh) // just to make sure
      return this.children[0]
  }
  
}

const defualtCallBack = node => {}

export class Quad extends THREE.Object3D{

  constructor({ size, resolution, dimension }){
    super()

    this.parameters = {
      size: size,
      resolution: resolution,
      dimension:  dimension
    }

    this.nodes = new Map()
    this.quadTreeController = new QuadTreeController()
  }

  createQuadTree({ levels }){
    Object.assign(this.quadTreeController.config,{
      maxLevelSize:  this.parameters.size,
      minLevelSize:  Math.floor(this.parameters.size/Math.pow(2,levels-1)), // this create a vizual bug in the lower levels when size not a power of 2 
      minPolyCount:  this.parameters.resolution,
      dimensions:    this.parameters.dimension,
      }
    )
    this.quadTreeController.levels(levels)
    this.quadTreeController.createArrayBuffers()
    this.quadTree = new QuadTree()
  }  

  addNode(bounds,node){
    this.nodes.set(bounds,node)
  }

  thread(){
    this.threading = true
  }

  createPlane({
    material,
    size,
    resolution,
    matrixRotationData,
    offset,
    shardedData,
    node,
    callBack,
    parent,
    geometryClass = QuadGeometry, // Default to QuadGeometry for parent class
    additionalPayload = {}, // Additional data for child class
  }) {
    if (this.threading) {
      // Initialize SharedArrayBuffers
      const sharedArrayUv       = new SharedArrayBuffer(shardedData.geometryData.byteLengthUv);
      const sharedArrayIndex    = new SharedArrayBuffer(shardedData.geometryData.byteLengthIndex);
      const sharedArrayPosition = new SharedArrayBuffer(shardedData.geometryData.byteLengthPosition);
      const sharedArrayNormal   = new SharedArrayBuffer(shardedData.geometryData.byteLengthNormal);
      
      // Include direction vectors buffer for specific geometry if needed
      const sharedArrayDirVect = geometryClass === NormalizedQuadGeometry
        ? new SharedArrayBuffer(shardedData.geometryData.byteLengthNormal)
        : null;
  
      const positionBuffer = new Float32Array(sharedArrayPosition);
      const normalBuffer   = new Float32Array(sharedArrayNormal);
      const uvBuffer       = new Float32Array(sharedArrayUv);
      const indexBuffer    = new Uint32Array(sharedArrayIndex);
      const dirVectBuffer  = sharedArrayDirVect ? new Float32Array(sharedArrayDirVect) : null;
  
      // Create a Blob with the appropriate worker source
      
      const blob = new Blob(
        [workersSRC(geometryClass.name, [QuadGeometry, (geometryClass === QuadGeometry) ? '' : geometryClass ] )],
        { type: 'application/javascript' }
      );
      const threadController = new ThreadController(new Worker(URL.createObjectURL(blob), { type: 'module' }));
  
      // Set up worker payload
      threadController.setPayload({
        sharedArrayPosition,
        sharedArrayNormal,
        sharedArrayIndex,
        sharedArrayUv,
        ...(sharedArrayDirVect && { sharedArrayDirVect }),
        matrixRotationData,
        offset,
        size,
        resolution,
        ...additionalPayload, // Include additional child-class specific data
      });
  
      const promise = new Promise((resolve) => {
        threadController.getPayload((payload) => {
          const buffers = {
            positionBuffer,
            normalBuffer,
            uvBuffer,
            indexBuffer,
            ...(dirVectBuffer && { dirVectBuffer }),
          };
  
          const geometry = new geometryClass(size, size, resolution, resolution, ...Object.values(additionalPayload));
          geometry.setIndex(Array.from(buffers.indexBuffer));
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(buffers.positionBuffer, 3));
          geometry.setAttribute('normal', new THREE.Float32BufferAttribute(buffers.normalBuffer, 3));
          geometry.setAttribute('uv', new THREE.Float32BufferAttribute(buffers.uvBuffer, 2));
  
          if (dirVectBuffer) { geometry.setAttribute('directionVectors', new THREE.Float32BufferAttribute(buffers.dirVectBuffer, 3)); }
  
          const plane   = new THREE.Mesh(geometry, material);
          plane.position.set(...payload.data.centerdPosition);
          parent.add(node.add(plane));
          callBack(node);
          resolve(node);
        });
      });
  
      promise.uuid = node.uuid;
      return promise;
  
    } else {
      // Non-threaded implementation
      const matrix = matrixRotationData.propMehtod
        ? new THREE.Matrix4()[[matrixRotationData.propMehtod]](matrixRotationData.input)
        : new THREE.Matrix4();
  
      const geometry = new geometryClass(size, size, resolution, resolution, ...Object.values(additionalPayload));
      geometry._setMatrix({ matrix });
      geometry._setOffset({ offset });
      geometry._build();
  
      const centerdPosition = new THREE.Vector3();
      geometry._restGeometry(centerdPosition);
  
      const plane   = new THREE.Mesh(geometry, material);
      plane.position.set(...centerdPosition);
      parent.add(node.add(plane));
      parent.add(node);
      callBack(node);
      return node;
    }
  }
  

  createNewNode({ shardedData, matrixRotationData, offset, index, direction, callBack, parent = this }){

    const quadTreeController = this.quadTreeController
    const size  = shardedData.geometryData.parameters.width
    const segments  = shardedData.geometryData.parameters.widthSegments

    let material = quadTreeController.config.material

    let metaData = {   
      index,  
      offset,  
      direction,
      matrixRotationData
    }

    let quadtreeNode = new QuadTreeNode( {size, segments, metaData, quadTreeController}, (this instanceof Sphere))
    this.add(quadtreeNode)
    let bounds = this.localToWorld(new THREE.Vector3().copy(quadtreeNode.position))

    this.quadTree.rootNodes.push(quadtreeNode)
     let node = new Node( {size, segments, bounds, metaData} )

    node = this.createPlane({
      material:material,
      size:size,
      resolution:segments,
      matrixRotationData: matrixRotationData,
      offset:offset,
      shardedData,
      node,
      callBack,
      parent
    })

    let boundsStr = `${bounds.x}_${bounds.y}_${quadtreeNode.params.size}`
    this.addNode(boundsStr,node)

    return node
  }

  createDimensions(callBack = defualtCallBack ){
    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeController.config.arrybuffers[w]

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
    const shardedData = this.quadTreeController.config.arrybuffers[w]

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
    this.quadTreeController.config.radius = radius
  }

  createPlane(params){
   return super.createPlane(Object.assign(params,{ 
      geometryClass: NormalizedQuadGeometry, 
      additionalPayload: { radius: this.quadTreeController.config.radius }
    }))
  }

  createDimensions(callBack = defualtCallBack){
    return super.createDimensions(callBack)
  }
}

/*
export class BatchedPrimative extends THREE.BatchedMesh{

  constructor( primative ){
    super( 7, 20000, 200000, new THREE.MeshStandardNodeMaterial({color:'red'})  )
    this.primative = primative
    }

  createInstances( callBack = defualtCallBack  ){
    
    this.primative.createDimensions((node)=>{

      const parent = node.parent;

      parent.remove( node );

      let geometry = node.plane().geometry 

      const boxGeometryId = this.addGeometry( geometry );
      
      const id = this.addInstance( boxGeometryId );

      callBack(node)

      //node.matrixWorld.decompose( node.position, node.quaternion, node.scale );

    } )

  }
}*/