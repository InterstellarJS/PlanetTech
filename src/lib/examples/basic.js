import { Moon } from "../PlanetTech/celestialBodies/moon"
import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import {SrcManager} from './utils'

export async function basic(){
    let moon = new Moon({
        size:            10000,
        polyCount:          50,
        quadTreeDimensions:  4,
        levels:              1,
        radius:          80000,
        displacmentScale: 1.5,
        lodDistanceOffset: 7.4,
        material: new NODE.MeshBasicNodeMaterial(),
      })
      let D = await Promise.all([
        new THREE.TextureLoader().loadAsync('./planet/displacement/right_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/left_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/top_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/bottom_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/front_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/back_displacement_image.png'),
      ])
    
    let N = await Promise.all([
        new THREE.TextureLoader().loadAsync('./planet/normal/right_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/left_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/top_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/bottom_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/front_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/back_normal_image.png'),
      ])
    
      moon.textuers(N,D)
      moon.light(NODE.vec3(0.0,-6.5,6.5))
      return moon
}


export async function addTextureTiles(){
  let src = SrcManager()
  let colorText = src.color[0]

  let moon = new Moon({
      size:            10000,
      polyCount:          50,
      quadTreeDimensions:  4,
      levels:              1,
      radius:          80000,
      displacmentScale: 1.5,
      lodDistanceOffset: 7.4,
      material: new NODE.MeshBasicNodeMaterial(),
    })

  
    await moon.front.addTextureTiles ([colorText,colorText],1.)
    await moon.back.addTextureTiles  ([colorText,colorText],1.)
    //await moon.right.addTextureTiles ([colorText,colorText],1.)
    //await moon.left.addTextureTiles  ([colorText,colorText],1.)
    //await moon.top.addTextureTiles   ([colorText,colorText],1.)
    //await moon.bottom.addTextureTiles([colorText,colorText],1.)

    //moon.light(NODE.vec3(0.0,-6.5,6.5))

    moon.front .lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.back  .lighting(NODE.vec3(0.0,-6.5,6.5))
    return moon
}