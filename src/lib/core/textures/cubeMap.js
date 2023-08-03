
import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer_    from '../../render'
import * as NODE   from 'three/nodes';
import {snoise3D,noiseNormal}  from  './../shaders/glslFunctions'

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
  
    noiseFBM(params){
        this.cube.children.map((p)=>{
            var n1 = `fbmNoise.call(params)` 
            p.material.colorNode = n1
        })
    }

    snoise3D(params){
        this.cube.children.map((p)=>{
            var n1 = snoise3D.call(params) 
            p.material.colorNode = n1
        })
    }
    
    displacementNormalNoiseFBM(params){
        this.cube.children.map((p)=>{
            var n1 = `displacementNormalNoiseFBM.call(params)` 
            p.material.colorNode = n1
        })
    }

    centerPosition(c) {
        var bbox  = new THREE.Box3();
        bbox.expandByObject(c);
        var center = new THREE.Vector3();
        bbox.getCenter(center);
        return center
      }
    



build(normals){

    this. frtt = new RtTexture(512)
    this. frtt.initRenderTraget()
    this. brtt = new RtTexture(512)
    this. brtt.initRenderTraget()
    this. rrtt = new RtTexture(512)
    this. rrtt.initRenderTraget()
    this. lrtt = new RtTexture(512)
    this. lrtt.initRenderTraget()
    this. trtt = new RtTexture(512)
    this. trtt.initRenderTraget()
    this. bortt = new RtTexture(512)
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

    let cube = new THREE.Group()
    cube.add(front,back,right,left,top,bottom)
    let center = this.centerPosition(cube)

    for (let index = 0; index < cube.children.length; index++) {
        const element =  cube.children[index];
        element.geometry.computeTangents()
        var cnt_ = center.clone()
        element.worldToLocal(cnt_)
        var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
        var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
        if(normals){
            element.material.colorNode = noiseNormal.call({worldPosition:wp.mul(.2),normal:NODE.normalLocal,tangent:NODE.tangentLocal}).x
        }else{
            element.material.colorNode = noiseNormal.call({worldPosition:wp.mul(.2),normal:NODE.normalLocal,tangent:NODE.tangentLocal}).yzw
        }
    }


    this.frtt.rtScene.add(cube.clone())
    this.brtt.rtScene.add(cube.clone())
    this.rrtt.rtScene.add(cube.clone())
    this.lrtt.rtScene.add(cube.clone())
    this.trtt.rtScene.add(cube.clone())
    this.bortt.rtScene.add(cube.clone())


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