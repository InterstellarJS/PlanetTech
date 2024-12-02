import * as THREE from 'three/tsl'
import { QuadTreeLODCore,QuadTreeLOD } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'


const defualtCallBack =(q,state)=>{
  state.add(q.plane)
  state.addInstances(q)
}


function shardedBuffer(quad){
  //const bufferPositionF      = new SharedArrayBuffer(byteLengthPosition); 
  //const bufferNormalF        = new SharedArrayBuffer(byteLengthNormal);

  //const typedArrPF           = new Float32Array(bufferPositionF);
  //const typedArrNF           = new Float32Array(bufferNormalF);
}

export class Quad extends THREE.Object3D{
  constructor({ size, resolution, dimension }){
    super()

    this.parameters = {
      size: size,
      resolution: resolution,
      dimension:  dimension
    }

    this.metaData = {}

    this.quadTreeconfig = new QuadTreeLODCore()
    this.instances = { }
    this.neighbors = new Set()
  }

  addInstances(quad){
    this.instances[[quad.plane.uuid]] = quad
  }

  createPlane({ material, size, resolution, matrix, offset }){

    let geometry = new QuadGeometry( size, size, resolution, resolution )

    geometry._setMatrix({ matrix })

    geometry._setOffset({ offset })

    geometry._build()

    return new THREE.Mesh(geometry, material)
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

  createNewQuad({shardedData, matrixRotatioData, offset, threading=false }){

    if(threading)
      console.log('threadQuad')

    const width  = shardedData.geometryData.parameters.width
    const widthSegments  = shardedData.geometryData.parameters.widthSegments

    let material = this.quadTreeconfig.config.material

    const plane = this.createPlane({
      material:material,
      size:width,
      resolution:widthSegments,
      matrix: ( matrixRotatioData.propMehtod ? new THREE.Matrix4()[[matrixRotatioData.propMehtod]](matrixRotatioData.input) : new THREE.Matrix4() ),
      offset:offset
    })

    const quad = new Quad( width, widthSegments )
    
    quad.plane = plane

    return quad
    
  }

    createDimensions(callBack = defualtCallBack ,threading = false){

      const w = this.parameters.size
      const d = this.parameters.dimension
      const k = ((w/2)*d)
      const shardedData = this.quadTreeconfig.config.arrybuffers[w]

      for (var i = 0; i < d; i++) {
        var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
        for (var j = 0; j < d; j++) {
          var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
          let _index = i * d + j;
          let offset = [i_,-j_,k]
          const quad = this.createNewQuad({
            shardedData: shardedData,
            matrixRotatioData: {propMehtod:'',input:undefined},
            offset: [i_,-j_,k],
            threading:threading,
          })
          quad.metaData.index  = _index
          quad.metaData.offset = offset
          quad.metaData.direction = '+z'
          callBack(quad,this)
        }
      }
    }


    
  
}




export class Cube extends Quad {
  constructor({ size, resolution, dimension}){
    super({ size, resolution, dimension })
    
  }

  createDimensions( callBack = defualtCallBack ,threading = false ){
    
    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeconfig.config.arrybuffers[w]

    for (var i = 0; i < d; i++) {
      var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
      for (var j = 0; j < d; j++) {
        var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))
        let _index = i * d + j;

        const quadPZ = this.createNewQuad({ shardedData: shardedData, matrixRotatioData: {propMehtod:'',input:0}, offset: [i_,-j_,k] ,threading })
        quadPZ.metaData.index = _index
        quadPZ.metaData.direction = '+z'
        quadPZ.metaData.offset = [i_,-j_,k]
        callBack(quadPZ,this)

        const quadNZ = this.createNewQuad({ shardedData: shardedData,matrixRotatioData:{propMehtod:'makeRotationY',input:Math.PI }, offset:  [i_,-j_,-k]  ,threading   })
        quadNZ.metaData.index = _index
        quadNZ.metaData.direction = '-z'
        quadNZ.metaData.offset = [i_,-j_,-k]
        callBack(quadNZ,this)

        const quadPX = this.createNewQuad({ shardedData: shardedData, matrixRotatioData:{propMehtod:'makeRotationY',input:Math.PI/2 }, offset: [k,-j_,-i_]  ,threading  })
        quadPX.metaData.index = _index
        quadPX.metaData.direction = '+x'
        quadPX.metaData.offset = [k,-j_,-i_] 
        callBack(quadPX,this)

        const quadNX = this.createNewQuad({ shardedData: shardedData, matrixRotatioData:{propMehtod:'makeRotationY',input:-Math.PI/2 }, offset: [-k,-j_,-i_] ,threading })
        quadNX.metaData.index = _index
        quadNX.metaData.direction = '-x'
        quadNX.metaData.offset = [-k,-j_,-i_] 
        callBack(quadNX,this)

        const quadPY = this.createNewQuad({ shardedData: shardedData, matrixRotatioData:{propMehtod:'makeRotationX',input:-Math.PI/2 }, offset: [i_,k,j_]    ,threading  })
        quadPY.metaData.index = _index
        quadPY.metaData.direction = '+y'
        quadPY.metaData.offset = [i_,k,j_] 
        callBack(quadPY,this)

        const quadNY = this.createNewQuad({ shardedData: shardedData, matrixRotatioData:{propMehtod:'makeRotationX',input:Math.PI/2 },  offset: [i_,-k,j_]   ,threading  })
        quadNY.metaData.index = _index
        quadNY.metaData.direction = '-y'
        quadNY.metaData.offset = [i_,-k,j_]
        callBack(quadNY,this)

      }
    }
  }

}


export class Sphere extends Cube{

  constructor({ size, resolution, dimension, radius }){

    super({size, resolution, dimension})

    this.quadTreeconfig.config.radius = radius

  }

  createPlane({ material, size, resolution, matrix, offset }){

    let geometry = new NormalizedQuadGeometry( size, size, resolution, resolution, this.quadTreeconfig.config.radius)

    geometry._setMatrix({ matrix })

    geometry._setOffset({ offset })

    geometry._build()

    return new THREE.Mesh(geometry, material)
  }

}
