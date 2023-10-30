
import * as THREE  from 'three'
import * as NODE   from 'three/nodes';
import Quad        from './../PlanetTech/engine/quad';
import {RtTexture} from './rTtexture'
import { displayCanvasesInGrid } from './utils';
//import {snoise,normals, sdfbm2,} from '../../shaders/analyticalNormals';
import * as Shaders  from  './../PlanetTech/shaders/index.js'
import { TileMap } from './tileMap';


let calculateNormal  = NODE.glslFn(
  `
   vec3 calculateNormal(vec3 position, float epsilon_){
    float scale    = 0.9;   
    float epsilon  = epsilon_;  
    float strength = 1.;                   
    float center = snoise3D(position); // Sample displacement map
    float dx     = snoise3D(position + vec3(epsilon, 0.0, 0.0)) - center; 
    float dy     = snoise3D(position + vec3(0.0, epsilon,0.0)) - center; 
    vec3 normalMap = normalize(vec3(dx * scale, dy * scale, 1.0));              
    normalMap *= strength;                                                       
    return vec3(normalMap * 0.5 + 0.5);                                     
  }
`,[Shaders.snoise3D]
)




let canvasFlip = (fcanvas, rtt)=>{
        var ctx = fcanvas.getContext('2d');

        //https://jsfiddle.net/miguelmyers8/n5trq07w/3/
        var scaleH =  -1 
        var scaleV =  1 

        var posX =  rtt.rtWidth * -1  // Set x position to -100% if flip horizontal 
        var posY =  0; // Set y position to -100% if flip vertical

        ctx.save(); // Save the current state
        ctx.scale(scaleH, scaleV); // Set scale to flip the image
        ctx.drawImage(fcanvas, posX, posY, rtt.rtWidth, rtt.rtWidth); // draw the image
        ctx.restore(); // Restore the last saved state

        var scaleH =  -1 
        var scaleV =  -1 

        var posX =  rtt.rtWidth * -1  // Set x position to -100% if flip horizontal 
        var posY =  rtt.rtWidth * -1; // Set y position to -100% if flip vertical

        ctx.save(); // Save the current state
        ctx.scale(scaleH, scaleV); // Set scale to flip the image
        ctx.drawImage(fcanvas, posX, posY, rtt.rtWidth, rtt.rtWidth); // draw the image
        ctx.restore(); // Restore the last saved state
}



let noiseGenorater = `
        float noiseGenorater(vec3 position,vec3 eps){
          float noise;
          return noise;
        }`

export class CubeMap{
    constructor(wxh,d,mapType=false){
        this.w  = wxh
        this.h  = wxh
        this.ws = 1
        this.hs = 1
        this.d  = d
        this.textuerArray = []
        this.mapType = mapType
       }
    
    centerPosition(c) {
        var bbox  = new THREE.Box3();
        bbox.expandByObject(c);
        var center = new THREE.Vector3();
        bbox.getCenter(center);
        return center
      }
    
    buildRttMesh(size){
        const geometry = new THREE.PlaneGeometry(size,size,1,1);
        const material = new NODE.MeshBasicNodeMaterial();
        const plane    = new THREE.Mesh( geometry, material );
        return plane
      }

    simplexNoise(params){
        let p = this.cube
        var newPostion = NODE.positionLocal
        p.material.colorNode =calculateNormal({position:newPostion.mul(params.scale),epsilon_:.5})
    }

    simplexNoiseFbm(op=`+`,params){
        let p = this.cube
        const newNoiseCode = `
          noise  ${op}= clamp(fbm(
            (
                (position + vec3(${0},${0},${0})) * float(${params.inScale})
            )+eps, 
            float(${params.seed}), 
            float(${params.scale}),
            float(${params.persistance}),
            float(${params.lacunarity}), 
            float(${params.redistribution}),
            int(${params.iteration}),
            ${params.terbulance}, 
            ${params.ridge}
            ),0.,1.);
        `
        noiseGenorater = noiseGenorater.replace("float noise;", "float noise;");
        noiseGenorater = noiseGenorater.replace("return noise;", newNoiseCode + "\n  return noise;");
        let fNoiseGen = NODE.glslFn(noiseGenorater,[Shaders.snoise3Dfbm])
        p.material.colorNode = fNoiseGen({position:NODE.positionLocal,eps:NODE.vec3(0,0,0)})  
    }

    toNormal(params){
        params.position = NODE.positionLocal
        let p = this.cube
        let fNoiseGen = NODE.glslFn(noiseGenorater,[Shaders.snoise3Dfbm])
        let calculateNormalFbm  = NODE.glslFn(`
             vec3 calculateNormal(vec3 position, float scale, float epsilon, float strength){               
              float center = noiseGenorater(position,vec3(0.0, 0.0, 0.0)); // Sample displacement map
              float dx     = noiseGenorater(position,vec3(epsilon, 0.0, 0.0)) - center; 
              float dy     = noiseGenorater(position,vec3(0.0, epsilon,0.0)) - center; 
              vec3 normalMap = normalize(vec3(dx * scale, dy * scale, 1.0));              
              normalMap *= strength;                                                       
              return vec3(normalMap * 0.5 + 0.5);                                     
            }
          `,[fNoiseGen])
          p.material.colorNode=calculateNormalFbm(params)
    }

    buildCube(){
        const geometry = new THREE.IcosahedronGeometry(1, 250);
        const material = new NODE.MeshBasicNodeMaterial({side: THREE.DoubleSide});
        const mesh = new THREE.Mesh( geometry, material );
        return mesh            
    }

    build(resoultion=512,renderer){
        this.cube  = this.buildCube()
        let cubeRT = new THREE.WebGLCubeRenderTarget( resoultion );
        let camera = new THREE.CubeCamera( .0001, 100000,cubeRT);
        this.rtt   = new RtTexture(resoultion,renderer)
        this.rtt.initRenderTraget()
        this.rtt.renderTarget = cubeRT
        this.rtt.rtCamera = camera
        this.rtt.rtScene.add(this.cube)
        }
      
    snapShotRight(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(0)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            this.rtt.download(canvas,`r`)
        }
    }

    snapShotLeft(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(1)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            this.rtt.download(canvas,`l`)
        }    
    }

    snapShotTop(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(2)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            this.rtt.download(canvas,`t`)
        }    }


    snapShotBottom(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(3)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            this.rtt.download(canvas,`bo`)
        }
    }


    snapShotFront(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(4)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            this.rtt.download(canvas,`f`)
        }
    }


    snapShotBack(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(5)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            this.rtt.download(canvas,`b`)
        }
    }

    snapShot(download=false,normal={}){
        if (!(Object.keys(normal).length === 0)){
            this.toNormal(normal)
        }
        this.snapShotRight (download)
        this.snapShotLeft  (download)
        this.snapShotTop   (download)
        this.snapShotBottom(download)
        this.snapShotFront (download)
        this.snapShotBack  (download)
    }

}