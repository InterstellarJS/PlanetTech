
import * as THREE  from 'three'
import * as NODE   from 'three/nodes'
import {RtTexture} from './rTtexture'
import { canvasFlip } from './utils'
import * as Shaders  from  './../PlanetTech/shaders/index.js'


export class CubeMap{
    constructor(mapType=false){
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

    simplexFbm(params,callBack,op=`add`){
       let p = this.cube
        let f = (eps_,color) =>{
            let cloneParams = Object.assign({}, params) 
            let offSet = NODE.vec3(0,0,0)
            let eps = (eps_) ? eps_ : NODE.vec3(0,0,0)
            cloneParams.v_ = ((NODE.positionLocal.add(offSet)).mul(cloneParams.inScale)).add(eps)
            let t1 = NODE.clamp(Shaders.snoise3Dfbm(cloneParams),0,1)
            let t2 = (callBack) ? callBack(t1,color) : t1[op](color)
            return t2
        }
        p.userData.funcList.push(f)
    }

    toNormal(params){
          let p = this.cube
          let calculateNormal =()=>{
            let sumCenter = NODE.vec3(0)
            let sumDx     = NODE.vec3(0)
            let sumDy     = NODE.vec3(0)
            p.userData.funcList.forEach(func => {
                sumCenter = func(NODE.vec3(0.0, 0.0, 0.0), sumCenter)
                sumDx     = func(NODE.vec3(params.epsilon, 0.0, 0.0),sumDx)
                sumDy     = func(NODE.vec3(0.0, params.epsilon, 0.0),sumDy)
            });
           sumDx = sumDx.sub(sumCenter)
           sumDy = sumDy.sub(sumCenter)
           let normalMap = NODE.vec3(sumDx.r.mul(params.scale), sumDy.r.mul(params.scale), 1.0).normalize()
           normalMap     = normalMap.mul(params.strength) 
           return normalMap.mul(0.5).add(0.5)  
          }
          p.material.colorNode = calculateNormal()
    }

    toDisplace(){
        let p = this.cube
        let calculateDisplace = ()=>{
          let sumCenter = NODE.vec3(0)
          p.userData.funcList.forEach(func => {
              sumCenter= func(NODE.vec3(0.0, 0.0, 0.0),sumCenter)
          });
         return sumCenter 
        }
        p.material.colorNode = calculateDisplace()
    }

    buildCube(){
        const geometry = new THREE.IcosahedronGeometry(1, 250);
        const material = new NODE.MeshBasicNodeMaterial({side: THREE.DoubleSide});
        const mesh = new THREE.Mesh( geometry, material );
        mesh.userData.funcList = []
        mesh.material.colorNode = NODE.float(0)
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
            if(this.mapType){
                this.rtt.download(canvas,`nr`)
            }else{
                this.rtt.download(canvas,`r`)
            }
        }
    }

    snapShotLeft(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(1)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nl`)
            }else{
                this.rtt.download(canvas,`l`)
            }
        }    
    }

    snapShotTop(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(2)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nt`)
            }else{
                this.rtt.download(canvas,`t`)
            }
        }    
    }

    snapShotBottom(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(3)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nbo`)
            }else{
                this.rtt.download(canvas,`bo`)
            }
        }
    }

    snapShotFront(download=false){
        this.rtt.rtCamera.update(this.rtt.renderer_,this.rtt.rtScene)
        let fpixels = this.rtt.getSpherePixels(4)
        let canvas = this.rtt.toImage(fpixels)
        canvasFlip(canvas,this.rtt)
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nf`)
            }else{
                this.rtt.download(canvas,`f`)
            }
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
        }else{
            this.toDisplace()
        }
        this.snapShotRight (download)
        this.snapShotLeft  (download)
        this.snapShotTop   (download)
        this.snapShotBottom(download)
        this.snapShotFront (download)
        this.snapShotBack  (download)
    }

}