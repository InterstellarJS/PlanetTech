import {TileTextureManager } from "../cubeMap/tileTextureManager"
import {SrcManager} from './utils'
import { Moon } from "../PlanetTech/celestialBodies/moon"
import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import { getRandomColor,hexToRgbA  } from "../PlanetTech/engine/utils";


export async function tileTextureExample(renderer){
  let srcsN = [
    (SrcManager('right','normal')  .color[0]),
    (SrcManager('left','normal')   .color[0]),
    (SrcManager('top','normal')    .color[0]),
    (SrcManager('bottom','normal') .color[0]),
    (SrcManager('front','normal')  .color[0]),
    (SrcManager('back','normal')   .color[0]),
  ] 

  let srcsD = [
    (SrcManager('right','displacement')  .color[0]),
    (SrcManager('left','displacement')   .color[0]),
    (SrcManager('top','displacement')    .color[0]),
    (SrcManager('bottom','displacement') .color[0]),
    (SrcManager('front','displacement')  .color[0]),
    (SrcManager('back','displacement')   .color[0]),
  ] 

  let ttmN = new TileTextureManager(srcsN)
  let ttmD = new TileTextureManager(srcsD)

  let textN = await ttmN.initGlobal()
  let textD = await ttmD.initGlobal()

  let moon = new Moon({
    size:            10000,
    polyCount:          50,
    quadTreeDimensions:  4,
    levels:              4,
    radius:          80000,
    displacmentScale:  70.5,
    lodDistanceOffset: 10.4,
    material: new NODE.MeshBasicNodeMaterial()
  })
  moon.textuers(textN,textD,true)
  moon.light(NODE.vec3(0.0,-1.3,1.3))

  return moon
}



export async function fullTextureExample(renderer){
  let D = await Promise.all([
    new THREE.TextureLoader().loadAsync('./planet/color/d/right_displacement_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/d/left_displacement_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/d/top_displacement_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/d/bottom_displacement_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/d/front_displacement_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/d/back_displacement_image.png'),
  ])

let N = await Promise.all([
    new THREE.TextureLoader().loadAsync('./planet/color/c/right_color_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/c/left_color_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/c/top_color_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/c/bottom_color_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/c/front_color_image.png'),
    new THREE.TextureLoader().loadAsync('./planet/color/c/back_color_image.png'),
  ])
  let moon = new Moon({
    size:            10000,
    polyCount:          100,
    quadTreeDimensions:  1,
    levels:              4,
    radius:          80000,
    displacmentScale:  80.5,
    lodDistanceOffset: 12.4,
    material: new NODE.MeshBasicNodeMaterial()
  })
  moon.textuers(N,D)
  //moon.light(NODE.vec3(1.4,-1.4,1.3))
  return moon
}

