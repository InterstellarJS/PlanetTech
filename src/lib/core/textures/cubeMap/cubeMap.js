
import * as THREE  from 'three'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import {RtTexture} from './../rTtexture'
import * as NODE   from 'three/nodes';
import {snoise3D,fbmNoise,displacementNormalNoiseFBM,displacementFBM}  from  './../../shaders/glslFunctions'
import {snoise,normals, sdfbm2,} from '../../shaders/analyticalNormals';
import Quad from '../../sphere/quad';

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



function displayCanvasesInGrid(canvasArray,  gridSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageSize = canvasArray[0].width; // Assuming all canvases have the same size

    canvas.width = Math.ceil(canvasArray.length / gridSize) * imageSize;
    canvas.height = gridSize * imageSize;

    for (let i = 0; i < canvasArray.length; i++) {
        const row = i % gridSize;
        const col = Math.floor(i / gridSize);
        const x = col * imageSize;
        const y = row * imageSize;

        ctx.drawImage(canvasArray[i], x, y);
    }
    return canvas
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
    constructor(w,h,ws,hs,d,mapType=false){
        this.w  = w
        this.h  = h
        this.ws = ws
        this.hs = hs
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
        const geometry = new THREE.PlaneGeometry( 2,2,10,10);
        const material = new NODE.MeshBasicNodeMaterial();
        const plane = new THREE.Mesh( geometry, material );
        return plane
      }

      simplexNoise(params){
        this.allp.map((p)=>{
            p.geometry.computeTangents()
            var cnt_ = this.center.clone()
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            p.material.colorNode = snoise3D.call({v:newPostion.mul(.3)})
        })

    }
  
      simplexNoiseFbmD(params){

    }
 

    simplexNoiseFbm(params){

    }




    buildCube(){
  

        this.front = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.front.createQuadTree(1)
        this.front.createDimensions('front')
        var front = new THREE.Group();
        front.add( ...this.front.instances.map(x=>x.plane) );

        this.back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.back.createQuadTree(1)
        this.back.createDimensions('back')
        var back = new THREE.Group();
        back.add( ...this.back.instances.map(x=>x.plane) );
        back.position.z = -this.w*this.d;
        back.rotation.y =  Math.PI;

        this.right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.right.createQuadTree(1)
        this.right.createDimensions('right')
        var right = new THREE.Group();
        right.add( ...this.right.instances.map(x=>x.plane) );
        right.position.z = -(this.w*this.d)/2;
        right.position.x =  (this.w*this.d)/2;
        right.rotation.y =  Math.PI/2;

        this.left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.left.createQuadTree(1)
        this.left.createDimensions('left')
        var left = new THREE.Group();
        left.add( ...this.left.instances.map(x=>x.plane) );
        left.position.z =  -(this.w*this.d)/2;
        left.position.x =  -(this.w*this.d)/2;
        left.rotation.y =  -Math.PI/2;

        this.top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.top.createQuadTree(1)
        this.top.createDimensions('top')
        var top = new THREE.Group();
        top.add( ...this.top.instances.map(x=>x.plane) );
        top.position.z = -(this.w*this.d)/2;
        top.position.y =  (this.w*this.d)/2;
        top.rotation.x = -Math.PI/2;

        this.bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.bottom.createQuadTree(1)
        this.bottom.createDimensions('bottom')
        var bottom = new THREE.Group();
        bottom.add( ...this.bottom.instances.map(x=>x.plane) );
        bottom.position.z = -(this.w*this.d)/2;
        bottom.position.y = -(this.w*this.d)/2;
        bottom.rotation.x =  Math.PI/2;

        const cube  = new THREE.Group();

        cube.add(front);
        cube.add(back);
        cube.add(right);
        cube.add(left);
        cube.add(top);
        cube.add(bottom);

        this.center = this.centerPosition(cube)
    
        this.allp = [
            ...front.children,
            ...back.children,
            ...right.children,
            ...left.children,
            ...top.children,
            ...bottom.children,
          ]



            return cube
          }




    build(resoultion=512){
        this. cube = this.buildCube()
        let camera = new THREE.OrthographicCamera( this.w / - 2, this.w / 2, this.h / 2, this.h / - 2, 0, this.d*2 );
        this. frtt = new RtTexture(resoultion)
        this. frtt.initRenderTraget()
        this. frtt.rtCamera = camera.clone()
        this. frtt.rtScene.add(this.cube)
        }
      

        snapShotFront(download=false){
            let canvases = []
            this.cube.children[0].children.map((e,i)=>{
                this.frtt.rtCamera.position.set(...e.position.toArray());
                this.frtt.snapShot()
                let fpixels = this.frtt.getPixels()
                let fcanvas = this.frtt.toImage(fpixels)
                canvases.push(fcanvas)
            })
            let canvas = displayCanvasesInGrid(canvases,this.d)
            if(download){this.frtt.download(canvas,`f`)}
            this.textuerArray.push(new THREE.CanvasTexture(canvas))
            this.frtt.rtCamera.position.set(0,0,0)

        }

        snapShotBack(download=false){
            let p = new THREE.Vector3()
            let canvases = []
            this.cube.children[1].children.map((e,i)=>{
                var cp = p.clone()
                e.getWorldPosition(cp)
                this.frtt.rtCamera.position.set(...cp.toArray());
                this.frtt.rtCamera.rotation.set(0,Math.PI,0);
                this.frtt.snapShot()
                let fpixels = this.frtt.getPixels()
                let fcanvas = this.frtt.toImage(fpixels)
                canvases.push(fcanvas)
            })
            let canvas = displayCanvasesInGrid(canvases,this.d)
            if(download){this.frtt.download(canvas,`b`)}
            this.textuerArray.push(new THREE.CanvasTexture(canvas))
            this.frtt.rtCamera.position.set(0,0,0)
            this.frtt.rtCamera.rotation.set(0,0,0)
        }


        snapShotRight(download=false){
            let p = new THREE.Vector3()
            let canvases = []
            this.cube.children[2].children.map((e,i)=>{
                var cp = p.clone()
                e.getWorldPosition(cp)
                this.frtt.rtCamera.position.set(...cp.toArray());
                this.frtt.rtCamera.rotation.set(0,Math.PI/2,0);
                this.frtt.snapShot()
                let fpixels = this.frtt.getPixels()
                let fcanvas = this.frtt.toImage(fpixels)
                canvases.push(fcanvas)
            })
            let canvas = displayCanvasesInGrid(canvases,this.d)
            if(download){this.frtt.download(canvas,`r`)}
            this.textuerArray.push(new THREE.CanvasTexture(canvas))
            this.frtt.rtCamera.position.set(0,0,0)
            this.frtt.rtCamera.rotation.set(0,0,0)
        }

        snapShotLeft(download=false){
            let p = new THREE.Vector3()
            let canvases = []
            this.cube.children[3].children.map((e,i)=>{
                var cp = p.clone()
                e.getWorldPosition(cp)
                this.frtt.rtCamera.position.set(...cp.toArray());
                this.frtt.rtCamera.rotation.set(0,-Math.PI/2,0);
                this.frtt.snapShot()
                let fpixels = this.frtt.getPixels()
                let fcanvas = this.frtt.toImage(fpixels)
                canvases.push(fcanvas)
            })
            let canvas = displayCanvasesInGrid(canvases,this.d)
            if(download){this.frtt.download(canvas,`l`)}
            this.textuerArray.push( new THREE.CanvasTexture(canvas))
            this.frtt.rtCamera.position.set(0,0,0)
            this.frtt.rtCamera.rotation.set(0,0,0)
        }

        snapShotTop(download=false){
            let p = new THREE.Vector3()
            let canvases = []
            this.cube.children[4].children.map((e,i)=>{
                var cp = p.clone()
                e.getWorldPosition(cp)
                this.frtt.rtCamera.position.set(...cp.toArray());
                this.frtt.rtCamera.rotation.set(-Math.PI/2,0,0);
                this.frtt.snapShot()
                let fpixels = this.frtt.getPixels()
                let fcanvas = this.frtt.toImage(fpixels)
                canvases.push(fcanvas)
            })
            let canvas = displayCanvasesInGrid(canvases,this.d)
            if(download){this.frtt.download(canvas,`t`)}
            this.textuerArray.push( new THREE.CanvasTexture(canvas))
            this.frtt.rtCamera.position.set(0,0,0)
            this.frtt.rtCamera.rotation.set(0,0,0)
        }

        snapShotbottom(download=false){
            let p = new THREE.Vector3()
            let canvases = []
            this.cube.children[5].children.map((e,i)=>{
                var cp = p.clone()
                e.getWorldPosition(cp)
                this.frtt.rtCamera.position.set(...cp.toArray());
                this.frtt.rtCamera.rotation.set(Math.PI/2,0,0);
                this.frtt.snapShot()
                let fpixels = this.frtt.getPixels()
                let fcanvas = this.frtt.toImage(fpixels)
                canvases.push(fcanvas)
            })
            let canvas = displayCanvasesInGrid(canvases,this.d)
            if(download){this.frtt.download(canvas,`bo`)}
            this.textuerArray.push(new THREE.CanvasTexture(canvas))
            this.frtt.rtCamera.position.set(0,0,0)
            this.frtt.rtCamera.rotation.set(0,0,0)
        }


        snapShot(download=false){
          this.snapShotFront(download)
          this.snapShotBack(download)
          this.snapShotRight(download)
          this.snapShotLeft(download)
          this.snapShotTop(download)
          this.snapShotbottom(download)
        }
    
}


export class CubeMapTexture{
    constructor(){
       this.displacementNormalGen =  [new CubeMap(true),new CubeMap(false)]
       }

        build(resoultion){
            this.displacementNormalGen.forEach((e,i)=>{
                e.build(resoultion[i])
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