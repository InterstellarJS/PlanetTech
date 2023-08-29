
import * as THREE  from 'three'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import {RtTexture} from './../rTtexture'
import * as NODE   from 'three/nodes';
import {snoise3D,fbmNoise,displacementNormalNoiseFBM,displacementFBM}  from  './../../shaders/glslFunctions'
import {snoise,normals, sdfbm2,} from '../../shaders/analyticalNormals';

function downloadFile(data, filename_=`0`) {
  let filename = `${filename_}_exported.obj`
  const blob = new Blob([data], { type: 'text/plain' });

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  // Append the link to the body and click it
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}



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
        const geometry = new THREE.PlaneGeometry( 2,2,10,10);
        const material = new NODE.MeshBasicNodeMaterial();
        const plane = new THREE.Mesh( geometry, material );
        return plane
      }

      simplexNoise(params){
        this.cube.children.map((p)=>{
            p.geometry.computeTangents()
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
                p.material.colorNode = snoise3D.call({v:wp.mul(0.05)})
        
        })
    }
  
      simplexNoiseFbmD(params){
        this.cube.children.map((p)=>{
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
            var sampleDir = wp.sub(cnt_).normalize()
            var shiftedScaledSample = sampleDir.mul(params.scale)
            if (!params.hasOwnProperty('samplePos')) {
                params.samplePos = shiftedScaledSample;
              }
            var n1 = sdfbm2.call(params) 
            if(p.material.colorNode){
                if(this.mapType){
                    p.material.colorNode = p.material.colorNode.xyz.add(normals.call({grad:n1,sampleDir:sampleDir}).xyz)
                }else{
                    p.material.colorNode = p.material.colorNode.add(n1.x.add(.8))
                }
            }else{
                if(this.mapType){
                    p.material.colorNode = normals.call({grad:n1,sampleDir:sampleDir}).xyz
                }else{
                    p.material.colorNode = n1.x.add(.3)
                }
            }
        })
    }
 

    simplexNoiseFbm(params){
        this.cube.children.map((p)=>{
            p.geometry.computeTangents()
            var cnt_ = this.center.clone()
            p.worldToLocal(cnt_)
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
            if (!params.hasOwnProperty('wp')) {
                params.wp = wp.mul(params.inScale);
              }
            if(this.mapType){
                p.material.colorNode = displacementNormalNoiseFBM.call(params).mul(.5).add(.5)
            }else{
                p.material.colorNode = displacementFBM.call(params).add(params.scaleHeightOutput)
            }
        })
    }




    build(resoultion=512){
        this. frtt = new RtTexture(resoultion)
        this. frtt.initRenderTraget()
        this. brtt = new RtTexture(resoultion)
        this. brtt.initRenderTraget()
        this. rrtt = new RtTexture(resoultion)
        this. rrtt.initRenderTraget()
        this. lrtt = new RtTexture(resoultion)
        this. lrtt.initRenderTraget()
        this. trtt = new RtTexture(resoultion)
        this. trtt.initRenderTraget()
        this. bortt = new RtTexture(resoultion)
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
      

        snapShotFront(){
            this.frtt.rtCamera.position.z = 1
            this.frtt.snapShot()
            this.textuerArray.push(this.frtt.renderTarget.texture)
        }

        snapShotBack(){
            this.brtt.rtCamera.position.z = -3
            this.brtt.rtCamera.rotation.set(0,Math.PI,0) 
            this.brtt.snapShot()
            this.textuerArray.push(this.brtt.renderTarget.texture)
        }


        snapShotRight(){
            this.rrtt.rtCamera.position.z = -1
            this.rrtt.rtCamera.position.x = 2
            this.rrtt.rtCamera.rotation.set(0,Math.PI/2,0) 
            this.rrtt.snapShot()
            this.textuerArray.push(this.rrtt.renderTarget.texture)
        }

        snapShotLeft(){
            this.lrtt.rtCamera.position.z = -1
            this.lrtt.rtCamera.position.x = -2
            this.lrtt.rtCamera.rotation.set(0,-Math.PI/2,0) 
            this.lrtt.snapShot()
            this.textuerArray.push(this.lrtt.renderTarget.texture)
        }

        snapShotTop(){
            this.trtt.rtCamera.position.z = -1
            this.trtt.rtCamera.position.y = 2
            this.trtt.rtCamera.rotation.set(-Math.PI/2,0,0) 
            this.trtt.snapShot()
            this.textuerArray.push(this.trtt.renderTarget.texture)
        }

        snapShotbottom(){
            this.bortt.rtCamera.position.z = -1
            this.bortt.rtCamera.position.y = -2
            this.bortt.rtCamera.rotation.set(Math.PI/2,0,0) 
            this.bortt.snapShot()
            this.textuerArray.push(this.bortt.renderTarget.texture)
        }


        snapShot(download=false){
          this.snapShotFront()
          this.snapShotBack()
          this.snapShotRight()
          this.snapShotLeft()
          this.snapShotTop()
          this.snapShotbottom()
          if(download){
            let fpixels = this.frtt.getPixels()
            let fcanvas = this.frtt.toImage(fpixels)
            this.frtt.download(fcanvas,'f')
            let f = this.cube.children[0]
            var exporter = new OBJExporter();
            var data = exporter.parse(f);
            downloadFile(data,'f');

            let bpixels = this.brtt.getPixels()
            let bcanvas = this.brtt.toImage(bpixels)
            this.brtt.download(bcanvas,'b')
            let b = this.cube.children[1]
            var exporter = new OBJExporter();
            var data = exporter.parse(b);
            downloadFile(data,'b');

            let rpixels = this.rrtt.getPixels()
            let rcanvas = this.rrtt.toImage(rpixels)
            this.rrtt.download(rcanvas,'r')
            let r = this.cube.children[2]
            var exporter = new OBJExporter();
            var data = exporter.parse(r);
            downloadFile(data,'r');

            let lpixels = this.lrtt.getPixels()
            let lcanvas = this.lrtt.toImage(lpixels)
            this.lrtt.download(lcanvas,'l')
            let l = this.cube.children[3]
            var exporter = new OBJExporter();
            var data = exporter.parse(l);
            downloadFile(data,'l');

            let tpixels = this.trtt.getPixels()
            let tcanvas = this.trtt.toImage(tpixels)
            this.trtt.download(tcanvas,'t')
            let t = this.cube.children[4]
            var exporter = new OBJExporter();
            var data = exporter.parse(t);
            downloadFile(data,'t');

            let bopixels = this.bortt.getPixels()
            let bocanvas = this.bortt.toImage(bopixels)
            this.bortt.download(bocanvas,'bo')
            let bo = this.cube.children[5]
            var exporter = new OBJExporter();
            var data = exporter.parse(bo);
            downloadFile(data,'bo');
          }
        }
    
}


export class CubeMapTexture{
    constructor(){
       this.displacementNormalGen =  [new CubeMap(true),new CubeMap(false)]
       }

        build(resoultion){
            this.displacementNormalGen.forEach((e)=>{
                e.build(resoultion)
            })  
        }

        simplexNoiseFbm(params){
            this.displacementNormalGen.forEach((e)=>{
                e.simplexNoiseFbm(params)
            })  
        }


        simplexNoiseFbmD(params){
            this.displacementNormalGen.forEach((e)=>{
                e.simplexNoiseFbmD(params)
            })  
        }

        snapShot(download){
            this.displacementNormalGen.forEach((e)=>{
                e.snapShot(download)
            })  
        }

        getTexture(){
            let normal       = this.displacementNormalGen[0].textuerArray
            let displacement = this.displacementNormalGen[1].textuerArray
            return {normal,displacement}
        }


    }