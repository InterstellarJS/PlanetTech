
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





export class CubeMap{
    constructor(wh,d=1,mapType=false){
        this.w  = wh
        this.h  = wh
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
        const geometry = new THREE.PlaneGeometry( size,size,1,1);
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
  
    simplexNoiseFbm(params){
        this.allp.map((p)=>{
            p.geometry.computeTangents()
            var cnt_ = this.center.clone()
            var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = newPostion;
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




    buildCube(){
  

        this.front = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.front.createQuadTree(1)
        this.front.createTiles('front')
        var front = new THREE.Group();
        front.add( ...this.front.instances );
        let fmain = this.buildRttMesh(this.w*this.d)
        fmain.position.set(...front.position.toArray())
        fmain.rotation.set(...front.rotation.toArray())

        this.back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.back.createQuadTree(1)
        this.back.createTiles('back')
        var back = new THREE.Group();
        back.add( ...this.back.instances);
        back.position.z = -this.w*this.d;
        back.rotation.y =  Math.PI;
        let bmain = this.buildRttMesh(this.w*this.d)
        bmain.position.set(...back.position.toArray())
        bmain.rotation.set(...back.rotation.toArray())

        this.right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.right.createQuadTree(1)
        this.right.createTiles('right')
        var right = new THREE.Group();
        right.add( ...this.right.instances );
        right.position.z = -(this.w*this.d)/2;
        right.position.x =  (this.w*this.d)/2;
        right.rotation.y =  Math.PI/2;
        let rmain = this.buildRttMesh(this.w*this.d)
        rmain.position.set(...right.position.toArray())
        rmain.rotation.set(...right.rotation.toArray())

        this.left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.left.createQuadTree(1)
        this.left.createTiles('left')
        var left = new THREE.Group();
        left.add( ...this.left.instances);
        left.position.z =  -(this.w*this.d)/2;
        left.position.x =  -(this.w*this.d)/2;
        left.rotation.y =  -Math.PI/2;
        let lmain = this.buildRttMesh(this.w*this.d)
        lmain.position.set(...left.position.toArray())
        lmain.rotation.set(...left.rotation.toArray())

        this.top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.top.createQuadTree(1)
        this.top.createTiles('top')
        var top = new THREE.Group();
        top.add( ...this.top.instances);
        top.position.z = -(this.w*this.d)/2;
        top.position.y =  (this.w*this.d)/2;
        top.rotation.x = -Math.PI/2;
        let tmain = this.buildRttMesh(this.w*this.d)
        tmain.position.set(...top.position.toArray())
        tmain.rotation.set(...top.rotation.toArray())


        this.bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.bottom.createQuadTree(1)
        this.bottom.createTiles('bottom')
        var bottom = new THREE.Group();
        bottom.add( ...this.bottom.instances);
        bottom.position.z = -(this.w*this.d)/2;
        bottom.position.y = -(this.w*this.d)/2;
        bottom.rotation.x =  Math.PI/2;
        let bomain = this.buildRttMesh(this.w*this.d)
        bomain.position.set(...bottom.position.toArray())
        bomain.rotation.set(...bottom.rotation.toArray())

        const cube  = new THREE.Group();
        const cube2  = new THREE.Group();

        cube.add(front);
        cube.add(back);
        cube.add(right);
        cube.add(left);
        cube.add(top);
        cube.add(bottom);

        cube2.add(fmain);
        cube2.add(bmain);
        cube2.add(rmain);
        cube2.add(lmain);
        cube2.add(tmain);
        cube2.add(bomain);
this.cube2 = cube2
        this.center = this.centerPosition(cube2)
    
        this.allp = [
            fmain,
            bmain,
            rmain,
            lmain,
            tmain,
            bomain,
          ]



            return cube
          }




    build(resoultion=512){
        this. cube = this.buildCube()
        let camera = new THREE.OrthographicCamera( this.w / - 2, this.w / 2, this.h / 2, this.h / - 2, 0, this.d*2 );
        this. frtt = new RtTexture(resoultion)
        this. frtt.initRenderTraget()
        this. frtt.rtCamera = camera.clone()
        this. frtt.rtScene.add(this.cube2)
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