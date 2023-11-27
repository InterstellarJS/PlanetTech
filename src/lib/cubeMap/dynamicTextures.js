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
            //console.log(imageBitmap)
            const texture = new THREE.CanvasTexture( imageBitmap );
            texture.needsUpdate = true
            texture.minFilter = THREE.LinearFilter
            texture.generateMipmaps  = false
            let mat  = new NODE.MeshBasicNodeMaterial()
            let mesh = new THREE.Mesh(g,mat)
            mesh.position.copy(element.position.clone())
            mesh.material.colorNode = NODE.texture(texture,NODE.uv())
            texture.onUpdate = function() {imageBitmap.close()};
            tileGroup.add(mesh);
        }
       // qf.instances.forEach(async (e,i)=>{
            /*
            let mat  = new NODE.MeshBasicNodeMaterial()
            let mesh = new THREE.Mesh(g,mat)
            mesh.position.copy(e.position.clone())
            mesh.material.colorNode = NODE.vec3(...hexToRgbA(getRandomColor()))
            tileGroup.add(mesh);
            */


            /*loader.load( srcs[i] , function ( imageBitmap ) {
                const texture = new THREE.CanvasTexture( imageBitmap );
                texture.needsUpdate = true
                texture.minFilter = THREE.LinearFilter
                texture.generateMipmaps  = false
                let mat  = new NODE.MeshBasicNodeMaterial()
                let mesh = new THREE.Mesh(g,mat)
                mesh.position.copy(e.position.clone())
                mesh.material.colorNode = NODE.texture(texture,NODE.uv())
                texture.onUpdate = function() {imageBitmap.close()};
                tileGroup.add(mesh);
            }, function ( p ) {
                console.log( p );
            }, function ( e ) {
                console.log( e );
            } );*/
        //})
        qf.instances = []
        return this.rtt.renderTarget.texture
     }

     update(){
      this.rtt.snapShot()  
     }    
}