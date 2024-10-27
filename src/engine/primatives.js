import * as THREE from 'three/tsl'
import { QuadTrees } from './quadtree.js'
import { QuadGeometry, NormalizedQuadGeometry } from './geometry.js'

export class Quad extends THREE.Object3D{

  constructor({ size, resolution, dimension }){
    super()

    this.parameters = {
      size : size,
      instances : [],
      resolution : resolution,
      dimension  : dimension
    }

    this.quadTreeconfig = new QuadTrees.QuadTreeLoDCore()

  }

  createPlane({ material, size, resolution, matrix, offset }){

    let geometry = new QuadGeometry( size, size, resolution, resolution)

    geometry._setMatrix({ matrix })

    geometry._setOffset({ offset })

    geometry._build()

    return new THREE.Mesh(geometry, material)
  }

  createNewQuad({ shardedGeometry, matrix, offset }){
    const width  = shardedGeometry.parameters.width
    const widthSegments  = shardedGeometry.parameters.widthSegments

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


}