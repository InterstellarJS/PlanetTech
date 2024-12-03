import * as THREE from 'three/tsl'
import { QuadTreeLODCore,QuadTreeLOD } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'
import { QuadWorker } from './webWorker/threading.js'
import { workersSRC } from './webWorker/workerThread.js'


const defualtCallBack =(q,state)=>{
  state.add(q.plane)
  state.addInstances(q)
}


export class Quad extends THREE.Object3D{
  constructor({ size, resolution, dimension }){
    super()

    this.parameters = {
      size: size,
      resolution: resolution,
      dimension:  dimension
    }

    this.metaData  = {}
    this.instances = {}
    this.neighbors = new Set()
    this.quadTreeconfig = new QuadTreeLODCore()

  }

  createQuadTree({ levels }){
    Object.assign(this.quadTreeconfig.config,{
      maxLevelSize:  this.parameters.size,
      minLevelSize:  Math.floor(this.parameters.size/Math.pow(2,levels-1)), // this create a vizual bug when not divisible by 2 
      minPolyCount:  this.parameters.resolution,
      dimensions:    this.parameters.dimension,
      }
    )
    this.quadTreeconfig.levels(levels)
    this.quadTreeconfig.createArrayBuffers()
    this.quadTree = new QuadTreeLOD()
  }  

  addInstances(quad){
    this.instances[[quad.plane.uuid]] = quad
  }

  thread(isThreading){
    this.threading = isThreading
  }

  createPlane({ material, size, resolution, matrixRotatioData, offset, shardedData, quad, callBack}){

    if(this.threading){
      console.log('threadQuad')
      const sharedArrayUv       = new SharedArrayBuffer(shardedData.geometryData.byteLengthUv       ); 
      const sharedArrayIndex    = new SharedArrayBuffer(shardedData.geometryData.byteLengthIndex    );
      const sharedArrayPosition = new SharedArrayBuffer(shardedData.geometryData.byteLengthPosition ); 
      const sharedArrayNormal   = new SharedArrayBuffer(shardedData.geometryData.byteLengthNormal   );
 
      const positionBuffer      = new Float32Array(sharedArrayPosition );
      const normalBuffer        = new Float32Array(sharedArrayNormal   );
      const uvBuffer            = new Float32Array(sharedArrayUv       );
      const indexBuffer         = new Uint32Array (sharedArrayIndex    );
 
      let blob       = new Blob([workersSRC(QuadGeometry.name,[QuadGeometry ])], {type: 'application/javascript'}); 
      let quadWorker = new QuadWorker(new Worker(URL.createObjectURL(blob),{ type: "module" }));

      quadWorker.setPayload({
        sharedArrayPosition,
        sharedArrayNormal,
        sharedArrayIndex,
        sharedArrayUv,
        matrixRotatioData,
        offset,
        size,
        resolution,
       });

       quadWorker.getPayload((payload)=>{

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

        quad.plane = new THREE.Mesh(geometry, material)
        callBack(quad,this)
        })
    }else{

    let matrix  = matrixRotatioData.propMehtod ? new THREE.Matrix4()[[matrixRotatioData.propMehtod]](matrixRotatioData.input) : new THREE.Matrix4() 

    let geometry = new QuadGeometry( size, size, resolution, resolution )

    geometry._setMatrix({ matrix })

    geometry._setOffset({ offset })

    geometry._build()

    quad.plane = new THREE.Mesh(geometry, material)
    
    callBack(quad,this)
    }
  }



  createNewQuad({shardedData, matrixRotatioData, offset,index,direction,callBack }){

    const width  = shardedData.geometryData.parameters.width
    const widthSegments  = shardedData.geometryData.parameters.widthSegments

    let material = this.quadTreeconfig.config.material

    const quad = new Quad( width, widthSegments )
    quad.metaData.index  = index
    quad.metaData.offset = direction
    quad.metaData.direction = '+z'
    
    this.createPlane({
      material:material,
      size:width,
      resolution:widthSegments,
      matrixRotatioData: matrixRotatioData,
      offset:offset,
      shardedData,
      quad,
      callBack,
    })


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
        this.createNewQuad({
          shardedData: shardedData,
          matrixRotatioData: {propMehtod:'',input:undefined},
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

         this.createNewQuad({ 
          shardedData: shardedData, 
          matrixRotatioData: {propMehtod:'',input:0}, 
          offset: [i_,-j_,k],
          index:_index,
          direction:'+z',
          callBack
        })
 
         this.createNewQuad({ 
          shardedData: shardedData,
          matrixRotatioData:{propMehtod:'makeRotationY',input:Math.PI }, 
          offset:  [i_,-j_,-k],
          index: _index,
          direction:'-z',
          callBack   
        })
 
         this.createNewQuad({ 
          shardedData: shardedData, 
          matrixRotatioData:{propMehtod:'makeRotationY',input:Math.PI/2 }, 
          offset: [k,-j_,-i_],
          index: _index,
          direction:'+x',
          callBack      
        })
 
        this.createNewQuad({ 
          shardedData: shardedData, 
          matrixRotatioData:{propMehtod:'makeRotationY',input:-Math.PI/2 }, 
          offset: [-k,-j_,-i_],
          index: _index,
          direction:'-x',
          callBack   
        })
 

        this.createNewQuad({ 
          shardedData: shardedData, 
          matrixRotatioData:{propMehtod:'makeRotationX',input:-Math.PI/2 }, 
          offset: [i_,k,j_],
          index: _index,
          direction:'+y',
          callBack       
        })


        this.createNewQuad({ 
          shardedData: shardedData, 
          matrixRotatioData:{propMehtod:'makeRotationX',input:Math.PI/2 },  
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

  createPlane({ material, size, resolution, matrixRotatioData, offset, shardedData, quad, callBack }){

    if(this.threading){
      console.log('threadQuad')
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
      let quadWorker = new QuadWorker(new Worker(URL.createObjectURL(blob),{ type: "module" }));

      quadWorker.setPayload({
        sharedArrayPosition,
        sharedArrayNormal,
        sharedArrayIndex,
        sharedArrayUv,
        sharedArrayDirVect,
        matrixRotatioData,
        offset,
        size,
        resolution,
        radius:this.quadTreeconfig.config.radius,
      });

      quadWorker.getPayload(( payload )=>{

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

          quad.plane = new THREE.Mesh(geometry, material)

          callBack(quad,this)
        })
    }else{

    let matrix  = matrixRotatioData.propMehtod ? new THREE.Matrix4()[[matrixRotatioData.propMehtod]](matrixRotatioData.input) : new THREE.Matrix4() 

    let geometry = new NormalizedQuadGeometry( size, size, resolution, resolution, this.quadTreeconfig.config.radius)

    geometry._setMatrix({ matrix })

    geometry._setOffset({ offset })

    geometry._build()

    quad.plane = new THREE.Mesh(geometry, material)
    
    callBack(quad,this)}
  }

}
