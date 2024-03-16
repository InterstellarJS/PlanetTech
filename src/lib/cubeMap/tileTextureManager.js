import Quad from "../PlanetTech/engine/quad"
import { RtTexture } from "./rTtexture"
import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import { getRandomColor,hexToRgbA } from "../PlanetTech/engine/utils";
import { addTextureTiles } from "../examples/basic";
import renderer from "../render";


async function loadTexture(src){
  let loader = new THREE.ImageBitmapLoader()
  if (renderer.getType() === 'WebGL')
    loader.setOptions({imageOrientation: 'flipY' });
  let imageBitmap =  await loader.loadAsync(src)
  let texture     = new THREE.CanvasTexture( imageBitmap );
  texture.needsUpdate = true
  texture.onUpdate    = function() {imageBitmap.close()};
  //texture.minFilter   = THREE.LinearFilter
  //texture.generateMipmaps  = false
  return texture
}

export class TileTextureManager{
    constructor(srcs){
      this.srcs = srcs
     } 

    async initGlobal(){
      let r  = []
      let l  = []
      let t  = []
      let bo = []
      let f  = []
      let ba = []

      let globalLvlscrsR  = this.srcs[0]
      let globalLvlscrsL  = this.srcs[1]
      let globalLvlscrsT  = this.srcs[2]
      let globalLvlscrsBo = this.srcs[3]
      let globalLvlscrsF  = this.srcs[4]
      let globalLvlscrsBa = this.srcs[5]

      let numOfSrcs = globalLvlscrsR.length

      for (let index = 0; index < numOfSrcs; index++) {
        r  .push(await loadTexture(globalLvlscrsR  [index]))
        l  .push(await loadTexture(globalLvlscrsL  [index]))
        t  .push(await loadTexture(globalLvlscrsT  [index]))
        bo .push(await loadTexture(globalLvlscrsBo [index]))
        f  .push(await loadTexture(globalLvlscrsF  [index]))
        ba .push(await loadTexture(globalLvlscrsBa [index]))
      }
      return [r,l,t,bo,f,ba]
     }

}