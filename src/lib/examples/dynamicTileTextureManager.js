import {TileTextureManager } from "../cubeMap/tileTextureManager"
import {SrcManager} from './utils'
import { Moon } from "../PlanetTech/celestialBodies/moon"
import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import { getRandomColor,hexToRgbA  } from "../PlanetTech/engine/utils";


export async function tileTextureManagerExample(renderer){
  let srcs = [
    (SrcManager('right')  .color[0]),
    (SrcManager('left')   .color[0]),
    (SrcManager('top')    .color[0]),
    (SrcManager('bottom') .color[0]),
    (SrcManager('front')  .color[0]),
    (SrcManager('back')   .color[0]),
  ] 

  let ttm = new TileTextureManager(srcs)

  let text = await ttm.initGlobal()

  let moon = new Moon({
    size:            10000,
    polyCount:          10,
    quadTreeDimensions:  4,
    levels:              3,
    radius:          80000,
    displacmentScale:  1.5,
    lodDistanceOffset: 12.4,
    material: new NODE.MeshBasicNodeMaterial()
  })

  moon.textuers(text,text,true)
  moon.light(NODE.vec3(0.0,-1.5,1.5))
  moon.position(3895,-8210,8390)
  moon.scale(1.5)

  return moon
}