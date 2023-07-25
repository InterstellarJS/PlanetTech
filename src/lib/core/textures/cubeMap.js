
import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer_    from '../../render'
import * as NODE   from 'three/nodes';
import {fbmNoise,snoise3D,displacemntNormalV3,displacementNormalNoiseFBM}  from  './../shaders/glslFunctions'


export class CubeMap{
    constructor(){
       }
       

    normals(canvasTexture,size,rend){
        var cp = new THREE.Vector3(0,0,1)
        var cr = new THREE.Vector3(0,0,0)
        this. nrtt = new RtTexture(size)
        this. nrtt.initRenderTraget()
        var nm = this. nrtt.toMesh(2, 2, 10, 10)
        this. nrtt.rtCamera.position.set(cp.x,cp.y,cp.z);
        this. nrtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
        this. nrtt.rtScene.add(nm)
        nm.material.colorNode = displacemntNormalV3(canvasTexture,NODE.uv()) 
        this. nrtt.snapShot(rend)
    }

    buildRttMesh(size){
        this.rtt = new RtTexture(size)
        this.rtt.initRenderTraget()
        this.cube = this.rtt.toMesh(2, 2, 10, 10)
        this.rtt.rtScene.add(this.cube) 
      }
  
    noiseFBM(params){
        var n1 = fbmNoise.call(params) 
        this.cube.material.colorNode = n1
    }

    snoise3D(params){
        var n1 = snoise3D.call(params) 
        this.cube.material.colorNode = n1
    }
    
    

    displacementNormalNoiseFBM(params){
        var n1 = displacementNormalNoiseFBM.call(params) 
        this.cube.material.colorNode = n1
    }

    snapShotFront(){
     var cp = new THREE.Vector3(0,0,1)
     var cr = new THREE.Vector3(0,0,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
     snapShotBack(){
     var cp = new THREE.Vector3(0,0,-1)
     var cr = new THREE.Vector3(0,Math.PI,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     renderer_.renderer.setRenderTarget(  this.rtt.renderTarget);
     this.rtt.snapShot(renderer_)
    }
    
    
    snapShotRight(){
     var cp = new THREE.Vector3(1,0,0)
     var cr = new THREE.Vector3(0,Math.PI/2,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
    
     snapShotLeft(){
     var cp = new THREE.Vector3(-1,0,0)
     var cr = new THREE.Vector3(0,-Math.PI/2,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
    snapShotTop(){
     var cp = new THREE.Vector3(0,1,0)
     var cr = new THREE.Vector3(-Math.PI/2,0,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
     snapShotBottom(){
     var cp = new THREE.Vector3(0,-1,0)
     var cr = new THREE.Vector3(Math.PI/2,0,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
}