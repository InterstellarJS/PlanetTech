import * as THREE from 'three/tsl'
import { QuadTreeLODCore,QuadTreeLOD } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'

export class Quad extends THREE.Object3D{
  constructor({ size, resolution, dimension }){
    super()

    this.parameters = {
      size : size,
      resolution : resolution,
      dimension  : dimension
    }

    this.quadTreeconfig = new QuadTreeLODCore()
    this.instances = []
  }

  createPlane({ material, size, resolution, matrix, offset }){

    let geometry = new QuadGeometry( size, size, resolution, resolution)

    geometry._setMatrix({ matrix })

    geometry._setOffset({ offset })

    geometry._build()

    return new THREE.Mesh(geometry, material)
  }

  createQuadTree(lvl){
    Object.assign(this.quadTreeconfig.config,{
      maxLevelSize:  this.parameters.size,
      minLevelSize:  Math.floor(this.parameters.size/Math.pow(2,lvl-1)), // this create a vizual bug when not divisible by 2 
      minPolyCount:  this.parameters.resolution,
      dimensions:    this.parameters.dimension,
      }
    )
    this.quadTreeconfig.levels(lvl)
    this.quadTreeconfig.createArrayBuffers()
    this.quadTree = new QuadTreeLOD()
  }  

  createNewQuad({ shardedData, matrix, offset }){
    const width  = shardedData.parameters.width
    const widthSegments  = shardedData.parameters.widthSegments

    let material = this.quadTreeconfig.config.material

    const plane = this.createPlane({
      material:material,
      size:width,
      resolution:widthSegments,
      matrix:matrix,
      offset:offset
    })

    const quad = new Quad( width, widthSegments )
    
    quad.plane = plane

    return quad
    
  }

    createDimensions(callBack=()=>{}){
      const w = this.parameters.size
      const d = this.parameters.dimension
      const k = ((w/2)*d)
      const shardedData = this.quadTreeconfig.config.arrybuffers[w].geometryData

      for (var i = 0; i < d; i++) {
        var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
        for (var j = 0; j < d; j++) {
          var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))

          const quad = this.createNewQuad({
            shardedData: shardedData,
            matrix: new THREE.Matrix4(),
            offset: [i_,-j_,k]
          })

          callBack(quad)

          this.instances.push(quad)

          this.add(quad.plane)

        }
      }
    }
  
}


export class Cube extends Quad {
  constructor({ size, resolution, dimension}){

    super({ size, resolution, dimension })
    
  }

  createDimensions(callBack=()=>{}){
    const w = this.parameters.size
    const d = this.parameters.dimension
    const k = ((w/2)*d)
    const shardedData = this.quadTreeconfig.config.arrybuffers[w].geometryData

    for (var i = 0; i < d; i++) {
      var i_ = ((i*(w-1))+i)+((-(w/2))*(d-1))
      for (var j = 0; j < d; j++) {
        var j_ = ((j*(w-1))+j)+((-(w/2))*(d-1))

        const quadPZ = this.createNewQuad({ shardedData: shardedData, matrix: new THREE.Matrix4(), offset: [i_,-j_,k]})
        callBack(quadPZ)

        const quadNZ = this.createNewQuad({ shardedData: shardedData,matrix: new THREE.Matrix4().makeRotationY( Math.PI ),    offset:  [i_,-j_,-k]  })
        callBack(quadNZ)

        const quadPX = this.createNewQuad({ shardedData: shardedData, matrix: new THREE.Matrix4().makeRotationY( Math.PI / 2), offset: [k,-j_,-i_]  })
        callBack(quadPX)

        const quadNX = this.createNewQuad({ shardedData: shardedData, matrix: new THREE.Matrix4().makeRotationY(-Math.PI / 2), offset: [-k,-j_,-i_] })
        callBack(quadNX)

        const quadPY = this.createNewQuad({ shardedData: shardedData, matrix: new THREE.Matrix4().makeRotationX(-Math.PI / 2), offset: [i_,k,j_]    })
        callBack(quadPY)

        const quadNY = this.createNewQuad({ shardedData: shardedData, matrix: new THREE.Matrix4().makeRotationX(Math.PI / 2),  offset: [i_,-k,j_]   })
        callBack(quadNY)

        this.instances.push(
          quadPZ,
          quadNZ,
          quadPX,
          quadNX,
          quadPY,
          quadNY
        )

        this.add(
          quadPZ.plane,
          quadNZ.plane,
          quadPX.plane,
          quadNX.plane,
          quadPY.plane,
          quadNY.plane
        )
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
