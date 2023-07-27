
import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer_    from '../../render'
import * as NODE   from 'three/nodes';
import {fbmNoise,snoise3D,displacemntNormalV3,displacementNormalNoiseFBM}  from  './../shaders/glslFunctions'


let undoTransfroms = NODE.func(`
vec3 undoTransfroms(vec3 v, vec3 undoPoition, mat4 rm){
    vec4 j =  (rm*vec4(v,1.));
    j.z += undoPoition.z;
    j.y += undoPoition.y;
    j.x += undoPoition.x;
    return j.xyz;
  }
`)

let move = NODE.func(`
vec3 move(vec3 j, vec3 m){
    j.z += m.z;
    j.y += m.y;
    j.x += m.x;
    return j.xyz;
  }
`)

let undoTransfroms2 = NODE.func(`
vec3 undoTransfroms2(vec3 v, vec3 undoPoition, mat4 rm){
    vec4 j =  (rm*vec4(v,1.));
    j.z += undoPoition.z;
    j.y += undoPoition.y;
    j.x += undoPoition.x;
    return j.xyz;
  }
`)



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
       }
       

    buildRttMesh(size){
        const geometry = new THREE.PlaneGeometry( 2,2,10,10);
        const material = new NODE.MeshBasicNodeMaterial();
        const plane = new THREE.Mesh( geometry, material );
        return plane
      }
  
    noiseFBM(params){
        this.cube.children.map((p)=>{
            var n1 = fbmNoise.call(params) 
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
            var n1 = displacementNormalNoiseFBM.call(params) 
            p.material.colorNode = n1
        })
    }


    



snapShotFront(params){

    let frtt = new RtTexture(512)
    frtt.initRenderTragetCubeMap()
    frtt.rtCamera.position.z = 1

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

    frtt.rtScene.add(front)
    frtt.rtScene.add(back)
    frtt.rtScene.add(right)
    frtt.rtScene.add(left)
    frtt.rtScene.add(top)
    frtt.rtScene.add(bottom)

    var n1 = snoise3D.call(params) 
    front.material.colorNode = n1
    var n1 = snoise3D.call(params) 
    back.material.colorNode = n1
    var n1 = snoise3D.call(params) 
    right.material.colorNode = n1
    var n1 = snoise3D.call(params) 
    left.material.colorNode = n1
    var n1 = snoise3D.call(params) 
    top.material.colorNode = n1
    var n1 = snoise3D.call(params) 
    bottom.material.colorNode = n1

        
    right.material.positionNode  = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(-rx,0,-rz),   rm:undorotationMatrixR})
    left.material.positionNode  = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(-lx,0,-lz),   rm:undorotationMatrixL})

    top.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(0,-ty,-tz),   rm:undorotationMatrixT})
    bottom.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(0,-boy,-boz), rm:undorotationMatrixBo})

    frtt.snapShot(renderer_)
    return frtt
    }
    
     snapShotBack(){
     var cp = new THREE.Vector3(0,0,-1)
     var cr = new THREE.Vector3(0,Math.PI,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     renderer_.renderer.setRenderTarget(  this.rtt.renderTarget);
     this.rtt.snapShot(renderer_)
    }
    
    
    snapShotRight(params){



        let rrtt = new RtTexture(512)
        rrtt.initRenderTragetCubeMap()
        rrtt.rtCamera.position.z = 1
    
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
    
        rrtt.rtScene.add(front)
        rrtt.rtScene.add(back)
        rrtt.rtScene.add(right)
        rrtt.rtScene.add(left)
        rrtt.rtScene.add(top)
        rrtt.rtScene.add(bottom)
    
        var n1 = snoise3D.call(params) 
        front.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        back.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        right.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        left.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        top.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        bottom.material.colorNode = n1


        front.material.positionNode  = move.call({j:NODE.positionLocal, m:NODE.vec3(-2,0,0)})
       right.material.positionNode  = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(-rx+2,0,-rz-2),   rm:undorotationMatrixR})

       top.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(0,-ty,-tz),   rm:undorotationMatrixT})


        top.material.positionNode = undoTransfroms2.call({
            v:top.material.positionNode, 
            undoPoition:NODE.vec3(-1,0,1),   
            rm: new THREE.Matrix4().makeRotationY(Math.PI/2)
        })
        back.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(bz,0,bz), rm:undorotationMatrixBa})
        bottom.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(0,-boy,-boz),rm:undorotationMatrixBo})
        bottom.material.positionNode = undoTransfroms2.call({
            v:bottom.material.positionNode, 
            undoPoition:NODE.vec3(-1,0,1),   
            rm: new THREE.Matrix4().makeRotationY(Math.PI/2)
        })
        rrtt.snapShot(renderer_)
        return rrtt
    }
    
    
     snapShotLeft(){
     var cp = new THREE.Vector3(-1,0,0)
     var cr = new THREE.Vector3(0,-Math.PI/2,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
    snapShotTop(params){
    


        let trtt = new RtTexture(512)
        trtt.initRenderTragetCubeMap()
        trtt.rtCamera.position.z = 1
    
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
    
        trtt.rtScene.add(front)
        trtt.rtScene.add(back)
        trtt.rtScene.add(right)
        trtt.rtScene.add(left)
        trtt.rtScene.add(top)
        trtt.rtScene.add(bottom)
    
        var n1 = snoise3D.call(params) 
        front.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        back.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        right.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        left.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        top.material.colorNode = n1
        var n1 = snoise3D.call(params) 
        bottom.material.colorNode = n1



        top.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(0,-ty,-tz-2),   rm:undorotationMatrixT})
        left.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(-lx,0,-lz),   rm:undorotationMatrixL})
        left.material.positionNode = undoTransfroms2.call({
            v:left.material.positionNode, 
            undoPoition:NODE.vec3(0,-1,1),  
            rm: new THREE.Matrix4().makeRotationX(-Math.PI/2)
        })
        right.material.positionNode  = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(-rx+2,0,-rz-2),   rm:undorotationMatrixR})
        right.material.positionNode = undoTransfroms2.call({
            v:right.material.positionNode, 
            undoPoition:NODE.vec3(0,1,1),  
            rm: new THREE.Matrix4().makeRotationX(-Math.PI/2)
        })
        front.material.positionNode  = move.call({j:NODE.positionLocal, m:NODE.vec3(0,-2,0)})
        back.material.positionNode = undoTransfroms.call({v:NODE.positionLocal, undoPoition:NODE.vec3(bz,0,bz), rm:undorotationMatrixBa})
        back.material.positionNode = undoTransfroms2.call({
            v:back.material.positionNode, 
            undoPoition:NODE.vec3(-2,2,0),  
            rm: new THREE.Matrix4().makeRotationZ(-Math.PI)
        })


        trtt.snapShot(renderer_)
        return trtt
    }
    
     snapShotBottom(){
     var cp = new THREE.Vector3(0,-1,0)
     var cr = new THREE.Vector3(Math.PI/2,0,0)
     this.rtt.rtCamera.position.set(cp.x,cp.y,cp.z) 
     this.rtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
     this.rtt.snapShot(renderer_)
    }
    
}