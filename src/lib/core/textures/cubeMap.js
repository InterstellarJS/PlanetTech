
import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer_    from '../../render'

  const cubeFaceOrientations = [
    new THREE.Euler(0, Math.PI/2, 0),
    new THREE.Euler(0, -Math.PI/2, 0),
    new THREE.Euler(-Math.PI/2, 0, 0),
    new THREE.Euler(Math.PI/2, 0, 0),
    new THREE.Euler(0, 0, 0),
    new THREE.Euler(0, Math.PI, 0)
  ];
  
export class CubeMap{
    constructor(material){
        this.textuerArray = []
        this.normalTextuerArray = []
        this.material = material
       }
       

    buildRttMesh(worldSpace=true){
        const geometry = new THREE.PlaneGeometry( 2,2,1,1);
        const material = this.material.getMaterial(worldSpace)
        this. quad     = new THREE.Mesh( geometry, material );
      }



    complie(textureResolution=512,download=false){
        this.rtt = new RtTexture(textureResolution)
        this.rtt.initRenderTraget()
        this.rtt.rtCamera.position.z = 1;
        this.rtt.rtScene.add(this.quad)
        for (let i = 0; i < 6; i++) {
            this.quad.rotation.copy(cubeFaceOrientations[i]);
            const target = new THREE.WebGLRenderTarget(
                this.rtt.rtWidth, 
                this.rtt.rtHeight, 
                {
                generateMipmaps: true, 
                depthBuffer: false,
                stencilBuffer: false
            });
            this.rtt.renderTarget = target //over write defualt render traget 
            this.rtt.snapShot(renderer_)
            if(download){
                let pixels = this.rtt.getPixels(renderer_)
                let canvas = this.rtt.toImage(pixels)
                this.rtt.download(canvas,i)
            }
            const texture = this.rtt.getTexture();
            this.textuerArray[i] = texture;
          }
    }


}