
import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer_    from '../../render'
import * as NODE   from 'three/nodes';
import {fbmNoise,snoise3D,noiseNormal,displacementNormalNoiseFBM}  from  './../shaders/glslFunctions'
import { snoise,normals,sdfbm } from '../shaders/analyticalNormals';

let widthHeight = 2
//---
var undorotationMatrixf = new THREE.Matrix4();
undorotationMatrixf.makeRotationY(0);
//---
let bz    = -widthHeight
let bry   = Math.PI
var undorotationMatrixBa = new THREE.Matrix4();
undorotationMatrixBa.makeRotationY(-bry);
//---
let rz    = -(widthHeight)/2;
let rx    =  (widthHeight)/2;
let rry   =  Math.PI/2;
var undorotationMatrixR = new THREE.Matrix4();
undorotationMatrixR.makeRotationY(-rry);
//---
let lz    =  -(widthHeight)/2;
let lx    =  -(widthHeight)/2;
let lry   =  -Math.PI/2;
var undorotationMatrixL = new THREE.Matrix4();
undorotationMatrixL.makeRotationY(-lry);
//---
let tz    =  -(widthHeight)/2;
let ty    =  (widthHeight)/2;
let trx   =  -Math.PI/2;
var undorotationMatrixT = new THREE.Matrix4();
undorotationMatrixT.makeRotationX(-trx);
//---
let boz   =  -(widthHeight)/2;
let boy   =  -(widthHeight)/2;
let borx  =  Math.PI/2;
var undorotationMatrixBo = new THREE.Matrix4();
undorotationMatrixBo.makeRotationX(-borx);

function setPositionRoation(planeMesh, x, y, z, rotationX, rotationY, rotationZ) {
    planeMesh.position.set(x, y, z);
    planeMesh.rotation.set(rotationX, rotationY, rotationZ);
    return planeMesh;
    }



export class CubeMap{
    constructor(){
        this.textuerArray = []
       }
       

    buildRttMesh(size){
        const geometry = new THREE.PlaneGeometry( 2,2,10,10);
        const material = new NODE.MeshBasicNodeMaterial();
        const plane = new THREE.Mesh( geometry, material );
        return plane
      }
  
      buildRttMeshNormal(texture){
        const geometry = new THREE.PlaneGeometry( 2,2,10,10);
        const material = new THREE.MeshNormalMaterial({bumpMap:texture,bumpScale:0.05});
        const plane = new THREE.Mesh( geometry, material );
        return plane
      }



    snoiseFBM(params){
        this.cube.children.map((p)=>{
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            //var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            //var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
            var position = NODE.positionWorld.sub(cnt_).normalize()
            var params = {
                v_:position.mul(40).add(NODE.normalLocal), 
                seed_:6.0, 
                scale_:0.3,  
                persistance_:2.0, 
                lacunarity_:0.5, 
                redistribution_:2.0, 
                octaves_:4, 
                iteration_:5, 
                terbulance_:false, 
                ridge_:false,

              }
            p.material.colorNode = fbmNoise.call(params)
        })
    }


    sdfbm(params,normal=false){
        this.cube.children.map((p)=>{
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
            var sampleDir = wp.sub(cnt_).normalize()
            var shiftedScaledSample = sampleDir.mul(8)
            var n1 = sdfbm.call({x:shiftedScaledSample,octaves:8,t:false}) 
            if(normal){
                p.material.colorNode = normals.call({grad:n1.yzw,sampleDir:sampleDir})
            }else{
                p.material.colorNode = n1.x
            }
        })
    }


    snoise3D(params,normal=false){
        this.cube.children.map((p)=>{
            p.geometry.computeTangents()
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
                p.material.colorNode = snoise3D.call({v:wp.mul(.08)})
        
        })
    }


    simplexDerivatives(params,normal=false){
        this.cube.children.map((p)=>{
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
            var sampleDir = wp.sub(cnt_).normalize()
            var shiftedScaledSample = sampleDir.mul(8)
            var n1 = snoise.call({v:shiftedScaledSample,gradient:NODE.vec3(0)}) 
            if(normal){
                p.material.colorNode = normals.call({grad:n1.yzw,sampleDir:sampleDir})

            }else{
                p.material.colorNode = n1.x
            }
        })
    }

    centerPosition(c) {
        var bbox  = new THREE.Box3();
        bbox.expandByObject(c);
        var center = new THREE.Vector3();
        bbox.getCenter(center);
        return center
      }
    

toNormal(displaceTextures){
    this. frtt = new RtTexture(2512)
    this. frtt.initRenderTraget()
    this. brtt = new RtTexture(2512)
    this. brtt.initRenderTraget()
    this. rrtt = new RtTexture(2512)
    this. rrtt.initRenderTraget()
    this. lrtt = new RtTexture(2512)
    this. lrtt.initRenderTraget()
    this. trtt = new RtTexture(2512)
    this. trtt.initRenderTraget()
    this. bortt = new RtTexture(2512)
    this. bortt.initRenderTraget()

    var front   = this.buildRttMeshNormal(displaceTextures[0])
    var back    = this.buildRttMeshNormal(displaceTextures[1])
    var right   = this.buildRttMeshNormal(displaceTextures[2])
    var left    = this.buildRttMeshNormal(displaceTextures[3])
    var top     = this.buildRttMeshNormal(displaceTextures[4])
    var bottom  = this.buildRttMeshNormal(displaceTextures[5])

    this.frtt.rtScene.add(front)
    this.brtt.rtScene.add(back)
    this.rrtt.rtScene.add(right)
    this.lrtt.rtScene.add(left)
    this.trtt.rtScene.add(top)
    this.bortt.rtScene.add(bottom)
}

build(){
    this. frtt = new RtTexture(2512)
    this. frtt.initRenderTraget()
    this. brtt = new RtTexture(2512)
    this. brtt.initRenderTraget()
    this. rrtt = new RtTexture(2512)
    this. rrtt.initRenderTraget()
    this. lrtt = new RtTexture(2512)
    this. lrtt.initRenderTraget()
    this. trtt = new RtTexture(2512)
    this. trtt.initRenderTraget()
    this. bortt = new RtTexture(2512)
    this. bortt.initRenderTraget()

    var front  = this.buildRttMesh()
    //----
    var back   = this.buildRttMesh()
    setPositionRoation(back,0,0,bz,0,bry,0)
    //----
    var right  = this.buildRttMesh()
    setPositionRoation(right,rx,0,rz,0,rry,0)
    //----
    var left   = this.buildRttMesh()
    setPositionRoation(left,lx,0,lz,0,lry,0)
    //----
    var top    = this.buildRttMesh()
    setPositionRoation(top,0,ty,tz,trx,0,0)
    //----
    var bottom = this.buildRttMesh()
    setPositionRoation(bottom,0,boy,boz,borx,0,0)

    this.cube = new THREE.Group()
    this.cube.add(front,back,right,left,top,bottom)
    this.center = this.centerPosition(this.cube)


    this.frtt.rtScene.add(this.cube.clone())
    this.brtt.rtScene.add(this.cube.clone())
    this.rrtt.rtScene.add(this.cube.clone())
    this.lrtt.rtScene.add(this.cube.clone())
    this.trtt.rtScene.add(this.cube.clone())
    this.bortt.rtScene.add(this.cube.clone())

    }
  
    snapShotNoramls(){
        [this.frtt,this.brtt,this.rrtt,this.lrtt,this.trtt,this.bortt].forEach((e)=>{
            e.rtCamera.position.z = 1
            e.snapShot(renderer_)
            this.textuerArray.push(e.renderTarget.texture)
        })      
    }

    snapShotFront(){
        this.frtt.rtCamera.position.z = 1
        this.frtt.snapShot(renderer_)
        this.textuerArray.push(this.frtt.renderTarget.texture)
    }

    snapShotBack(){
        this.brtt.rtCamera.position.z = -3
        this.brtt.rtCamera.rotation.set(0,Math.PI,0) 
        this.brtt.snapShot(renderer_)
        this.textuerArray.push(this.brtt.renderTarget.texture)
    }


    snapShotRight(){
        this.rrtt.rtCamera.position.z = -1
        this.rrtt.rtCamera.position.x = 2
        this.rrtt.rtCamera.rotation.set(0,Math.PI/2,0) 
        this.rrtt.snapShot(renderer_)
        this.textuerArray.push(this.rrtt.renderTarget.texture)
    }

    snapShotLeft(){
        this.lrtt.rtCamera.position.z = -1
        this.lrtt.rtCamera.position.x = -2
        this.lrtt.rtCamera.rotation.set(0,-Math.PI/2,0) 
        this.lrtt.snapShot(renderer_)
        this.textuerArray.push(this.lrtt.renderTarget.texture)
    }

    snapShotTop(){
        this.trtt.rtCamera.position.z = -1
        this.trtt.rtCamera.position.y = 2
        this.trtt.rtCamera.rotation.set(-Math.PI/2,0,0) 
        this.trtt.snapShot(renderer_)
        this.textuerArray.push(this.trtt.renderTarget.texture)
    }

    snapShotbottom(){
        this.bortt.rtCamera.position.z = -1
        this.bortt.rtCamera.position.y = -2
        this.bortt.rtCamera.rotation.set(Math.PI/2,0,0) 
        this.bortt.snapShot(renderer_)
        this.textuerArray.push(this.bortt.renderTarget.texture)
    }

    
}