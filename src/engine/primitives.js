import * as THREE from 'three/tsl'
import { QuadTreeController,QuadTree } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'
import { ThreadController } from './webWorker/threading.js'
import { workersSRC } from './webWorker/workerThread.js'
import { MeshNode,QuadTreeNode } from './nodes.js'
import { generateKey } from './utils.js'
 
export const isSphere = obj => obj instanceof Sphere

export class Primitive  extends THREE.Object3D{
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

  update(OBJECT3D){ this.quadTree.update(OBJECT3D,this) }

  addNode(bounds,node){ this.nodes.set(bounds,node) }

  threading(){ this.threaded = true }

  createQuadTree({ levels }){
    Object.assign(this.quadTreeController.config,{
      maxLevelSize:  this.parameters.size,
      minLevelSize:  this.parameters.size/Math.pow(2,levels-1), 
      minPolyCount:  this.parameters.resolution,
      dimensions:    this.parameters.dimension,
      }
    )
    this.quadTreeController.levels(levels)
    this.quadTreeController.createArrayBuffers()
    this.quadTree = new QuadTree()
  }  


}

export class Quad extends Primitive{

  constructor(params){
    super(params)
  }

  createPlane({
    material,
    size,
    resolution,
    matrixRotationData,
    offset,
    shardedData,
    node,
    parent,
    geometryClass = QuadGeometry, // Default to QuadGeometry for parent class
    additionalPayload = {}, // Additional data for child class
  }) {
    if (this.threaded) {
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
          this.quadTreeController.config.callBacks.onMeshCreation(node);
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
      this.quadTreeController.config.callBacks.onMeshCreation(node);
      return node;
    }
  }
  
  createNewNode({ shardedData, matrixRotationData, offset, index, direction,  parent = this }){

    const depth    = 1
    const size     = shardedData.geometryData.parameters.width
    const segments = shardedData.geometryData.parameters.widthSegments
    const quadTreeController = this.quadTreeController
    const material = quadTreeController.config.material

    let params = {   
      index,  
      offset,  
      direction,
      depth,
      matrixRotationData,
      size,
      segments,
      quadTreeController
     }

    const quadtreeNode = new QuadTreeNode( params , isSphere(this) ) 
    quadtreeNode.setBounds(this.add(quadtreeNode))
    this.quadTree.rootNodes.push(quadtreeNode)
    let meshNode = new MeshNode( params, 'active' )

    meshNode = this.createPlane({
      material,
      size,
      resolution:segments,
      matrixRotationData: matrixRotationData,
      offset:offset,
      shardedData,
      node:meshNode,
      parent
    })

     this.addNode(generateKey(quadtreeNode),meshNode)

    return meshNode
  }

  createDimensions(){
    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeController.config.arrybuffers[w]

    for (var i = 0; i < d; i++) {
      var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
      for (var j = 0; j < d; j++) {
        var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
        let _index = String(i * d + j);
        let node = this.createNewNode({
          shardedData: shardedData,
          matrixRotationData: {propMehtod:'',input:undefined},
          offset: [i_,-j_,k],
          index:_index,
          direction:'+z',
        })
      }
    }
  }
}

export class Cube extends Quad{

  constructor({ size, resolution, dimension}){
    super({ size, resolution, dimension }) 
  }

  createDimensions(){

    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeController.config.arrybuffers[w]

    for (var i = 0; i < d; i++) {
      var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
      for (var j = 0; j < d; j++) {
        var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
        let _index = String(i * d + j);

         this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData: {propMehtod:'',input:0}, 
          offset: [i_,-j_,k],
          index:_index,
          direction:'+z',
        })
 
         this.createNewNode({ 
          shardedData: shardedData,
          matrixRotationData:{propMehtod:'makeRotationY',input:Math.PI }, 
          offset:  [i_,-j_,-k],
          index: _index,
          direction:'-z',
        })
 
         this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationY',input:Math.PI/2 }, 
          offset: [k,-j_,-i_],
          index: _index,
          direction:'+x',
        })
 
        this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationY',input:-Math.PI/2 }, 
          offset: [-k,-j_,-i_],
          index: _index,
          direction:'-x',
        })
 
        this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationX',input:-Math.PI/2 }, 
          offset: [i_,k,j_],
          index: _index,
          direction:'+y',
        })

        this.createNewNode({ 
          shardedData: shardedData, 
          matrixRotationData:{propMehtod:'makeRotationX',input:Math.PI/2 },  
          offset: [i_,-k,j_],
          index: _index,
          direction:'-y',
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