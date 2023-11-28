import Quad from "../PlanetTech/engine/quad"
import { RtTexture } from "./rTtexture"
import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import { getRandomColor,hexToRgbA } from "../PlanetTech/engine/utils";

export class DynamicTextures{
    constructor(wxh,d){
      this.w  = wxh
      this.h  = wxh
      this.ws = 1
      this.hs = 1
      this.d  = d
     } 

     getTexture(){
        return this.rtt.renderTarget.texture
     }

     initRt(resoultion,renderer){
        let postCamera = new THREE.OrthographicCamera( (this.w*this.d) / - 2, (this.w*this.d) / 2, (this.h*this.d)/ 2, (this.h*this.d) / - 2, 0, this.d*2 );
        this. rtt  = new RtTexture(resoultion,renderer)
        this. rtt.initRenderTraget()
        this. rtt.rtCamera = postCamera.clone()
     }

     setResoultion(res){
        this.rtt.renderTarget.setSize(res,res)
     }

    
     async updateTileTexture(idx,scr){
       let oldMesh = this.rtt.rtScene.children[0].children[idx]
       oldMesh.material.visible = false
       let pos   = oldMesh.position.clone()
       let mesh  = new THREE.Mesh(new THREE.PlaneGeometry(this.w,this.h),new NODE.MeshBasicNodeMaterial())
       let group = this.rtt.rtScene.children[0]
       mesh.position.copy(pos)
       //let oldMesh = this.rtt.rtScene.children[0].children[idx]
       //oldMesh.geometry.dispose()
       //oldMesh.material.dispose()
       //this.rtt.rtScene.remove(oldMesh)
       //oldMesh.material.colorNode.dispose()
       console.log(scr)
       let loader = new THREE.ImageBitmapLoader()
       loader.setOptions( { imageOrientation: 'flipY' } );
       let imageBitmap = await loader.loadAsync(scr)
       const texture = new THREE.CanvasTexture( imageBitmap );
       texture.needsUpdate = true
       texture.minFilter = THREE.LinearFilter
       texture.generateMipmaps  = false
       mesh.material.colorNode = NODE.texture(texture,NODE.uv())
       texture.onUpdate = function() {imageBitmap.close()};
       group.add(mesh)
       
     }
     

    async build(srcs){
        let qf = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        qf.createQuadTree(1)
        qf.createTiles('')
        let tileGroup = new THREE.Group();
        this.rtt.rtScene.add(tileGroup)
        let g = new THREE.PlaneGeometry(this.w,this.h)
        for (let index = 0; index < qf.instances.length; index++) {
            const element = qf.instances[index];
            let loader = new THREE.ImageBitmapLoader()
            loader.setOptions( { imageOrientation: 'flipY' } );
            let imageBitmap = await loader.loadAsync(srcs[index])
            const texture = new THREE.CanvasTexture( imageBitmap );
            texture.needsUpdate = true
            texture.minFilter = THREE.LinearFilter
            texture.generateMipmaps  = false
            let mat  = new NODE.MeshBasicNodeMaterial()
            let mesh = new THREE.Mesh(g,mat)
            mesh.position.copy(element.position.clone())
            mesh.material.colorNode = NODE.texture(texture,NODE.uv())
            mesh.userData.layer = 0
            texture.onUpdate = function() {imageBitmap.close()};
            tileGroup.add(mesh);
        }
     }

     update(){
      this.rtt.snapShot()  
     }    
}


const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )

export class DynamicTileTextureManager{ // name too long
    constructor(wxh,d,renderer){ // d should probably not be exposed to user if this is a title texture that only hold one texture 
        this.wxh  = wxh
        this.d  = d
        this.renderer = renderer
    }

   async init(srcs,res){
    this. fa  = {}
    this. baa = {}
    this. ra  = {}
    this. la  = {}
    this. ta  = {}
    this. boa = {}
    this.count = srcs[0].length

    for (let index = 0; index < this.count; index++) {
        let fdt = new DynamicTextures(this.wxh,this.d)
        fdt.initRt(res,this.renderer)
        await fdt.build([srcs[0][index]])
        fdt.update()
        this.fa[index] = fdt

        let badt = new DynamicTextures(this.wxh,this.d)
        badt.initRt(res,this.renderer)
        await badt.build([srcs[1][index]])
        badt.update()
        this.baa[index] = badt

        let rdt = new DynamicTextures(this.wxh,this.d)
        rdt.initRt(res,this.renderer)
        await rdt.build([srcs[2][index]])
        rdt.update()
        this.ra[index] = rdt

        let ldt = new DynamicTextures(this.wxh,this.d)
        ldt.initRt(res,this.renderer)
        await ldt.build([srcs[3][index]])
        ldt.update()
        this.la[index] = ldt

        let tdt = new DynamicTextures(this.wxh,this.d)
        tdt.initRt(res,this.renderer)
        await tdt.build([srcs[4][index]])
        tdt.update()
        this.ta[index] = tdt

        let bodt = new DynamicTextures(this.wxh,this.d)
        bodt.initRt(res,this.renderer)
        await bodt.build([srcs[5][index]])
        bodt.update()
        this.boa[index] = bodt
        }
    }

    getTexture(){
        let ft  = []
        let bat = []
        let rt  = []
        let lt  = []
        let tt  = []
        let bot = []

        for (let index = 0; index < this.count; index++) {
            ft .push(this.fa[index].getTexture())
            bat.push(this.baa[index].getTexture())
            rt .push(this.ra[index].getTexture())
            lt .push(this.la[index].getTexture())
            tt .push(this.ta[index].getTexture())
            bot.push(this.boa[index].getTexture())
            }

        return [ft,bat,rt,lt,tt,bot]
    }

}