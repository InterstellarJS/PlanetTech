import {DynamicTextures, DynamicTileTextureManager } from "../cubeMap/dynamicTextures"
import {SrcManager} from './utils'
import { Moon } from "../PlanetTech/celestialBodies/moon"
import * as NODE  from 'three/nodes';
import * as THREE from 'three';

export async function dynamicTileTextureManagerExample(renderer){
    let srcs = SrcManager()
  
    let colorDt = new DynamicTileTextureManager(5,1,renderer)
    await colorDt.init([srcs.color,srcs.color,srcs.color,srcs.color,srcs.color,srcs.color],256)
    let colorText = colorDt.getTexture()

    /*let displacementDt = new DynamicTileTextureManager(5,1,renderer)
    await displacementDt.init([srcs.displacement,srcs.displacement,srcs.displacement,srcs.displacement,srcs.displacement,srcs.displacement],1)
    let displacementText = displacementDt.getTexture()*/

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
   
  
      moon.front.addTextureTiles ([colorText[0],colorText[0]],1.)
      moon.back.addTextureTiles  ([colorText[1],colorText[1]],1.)
      moon.right.addTextureTiles ([colorText[2],colorText[2]],1.)
      moon.left.addTextureTiles  ([colorText[3],colorText[3]],1.)
      moon.top.addTextureTiles   ([colorText[4],colorText[4]],1.)
      moon.bottom.addTextureTiles([colorText[5],colorText[5]],1.)
  
      moon.front.lighting(NODE.vec3(0.0,-6.5,6.5))
      moon.back.lighting(NODE.vec3(0.0,-6.5,6.5))
      moon.right.lighting(NODE.vec3(0.0,-6.5,6.5))
      moon.left.lighting(NODE.vec3(0.0,-6.5,6.5))
      moon.top.lighting(NODE.vec3(0.0,-6.5,6.5))
      moon.bottom.lighting(NODE.vec3(0.0,-6.5,6.5))
  
      setTimeout(async ()=>{
        await colorDt.fa[0].generateTexture('./planet/hm4.png',0,1)
        //colorDt.fa[0].setResoultion(800)
        colorDt.fa[0].update()
      },5900)
  
  
      setTimeout(async ()=>{
        await colorDt.fa[5].generateTexture('./planet/hm4.png',0,1)
        //colorDt.fa[5].setResoultion(800)
        colorDt.fa[5].update()
      },6900)


      setTimeout(async ()=>{
        colorDt.fa[5].active(0,0)
        colorDt.fa[5].update()
      },8900)      

      return moon
}


export async function dynamicTextureExample(renderer){
  let srcs = SrcManager()

  let colorDt = new DynamicTextures(5,4,renderer)
  colorDt.initRt(1024,renderer)


    await colorDt.generateTexture(srcs.color[0])
    colorDt.update()
  

  let text = colorDt.getTexture()
  let colorText = text
  let displacementText = text

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
 

    moon.front.addTexture([colorText,displacementText],1.)
    moon.back.addTexture([colorText,displacementText],1.)
    moon.right.addTexture([colorText,displacementText],1.)
    moon.left.addTexture([colorText,displacementText],1.)
    moon.top.addTexture([colorText,displacementText],1.)
    moon.bottom.addTexture([colorText,displacementText],1.)

    moon.front .lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.back  .lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.right .lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.left  .lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.top   .lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.bottom.lighting(NODE.vec3(0.0,-6.5,6.5))


    setTimeout(async ()=>{
      await colorDt.generateTexture(srcs.color[0][0],0,1)
      //colorDt.fa[0].setResoultion(800)
      colorDt.update()
    },5900)


    setTimeout(async ()=>{
      await colorDt.generateTexture('./planet/normal/front_normal_image.png',5,1)
      //colorDt.fa[5].setResoultion(800)
      colorDt.update()
    },6900)



    /*

    setTimeout(async ()=>{
      colorText.active(0,1)
      colorText.update()
    },8900)*/      

    return moon
}


export async function quadDynamicTileExample(renderer){
  let srcs = [SrcManager('right').color[0],SrcManager('left').color[0],SrcManager('top').color[0],SrcManager('bottom').color[0],SrcManager('front').color[0],SrcManager('back').color[0]] 

console.log(srcs)

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
 


    await moon.right.addTextureTiles ([srcs[0],srcs[0]],1.)
    await moon.left.addTextureTiles  ([srcs[1],srcs[1]],1.)
    await moon.top.addTextureTiles   ([srcs[2],srcs[2]],1.)
    await moon.bottom.addTextureTiles([srcs[3],srcs[3]],1.)
    await moon.front.addTextureTiles ([srcs[4],srcs[4]],1.)
    await moon.back.addTextureTiles  ([srcs[5],srcs[5]],1.)

    moon.right.lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.left.lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.front.lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.back.lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.top.lighting(NODE.vec3(0.0,-6.5,6.5))
    moon.bottom.lighting(NODE.vec3(0.0,-6.5,6.5))


    return moon
}