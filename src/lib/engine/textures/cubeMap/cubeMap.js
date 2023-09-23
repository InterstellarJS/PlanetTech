
import * as THREE  from 'three'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import {RtTexture} from './../rTtexture'
import * as NODE   from 'three/nodes';
import {snoise3D,fbmNoise,displacementNormalNoiseFBM,displacementFBM,displacementNormalNoiseFBMWarp,displacementNoiseFBMWarp}  from  './../../shaders/glslFunctions'
import {snoise,normals, sdfbm2,} from '../../shaders/analyticalNormals';
import Quad from '../../sphere/quad';
import { displayCanvasesInGrid } from './utils';


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
       

    addTexture(t){}

    log(){}

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
        plane.geometry.computeTangents()
        return plane
      }

      simplexNoise(params){
        params.vn = NODE.normalLocal 
        params.tangent = NODE.tangentLocal
        this.mainCubeSides.map((p)=>{
            var cnt_ = this.center.clone()
            var newPostion = NODE.float(params.radius).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            p.material.colorNode = snoise3D.call({v:newPostion.mul(params.scale)})
        })

    }
  
    simplexNoiseFbm(params){
        params.vn = NODE.normalLocal
        params.tangent = NODE.tangentLocal
        this.mainCubeSides.map((p)=>{
            var cnt_ = this.center.clone()
            var newPostion = NODE.float(params.radius).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
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

    simplexNoiseFbmWarp(params){
        params.vn = NODE.normalLocal
        params.tangent = NODE.tangentLocal
        this.mainCubeSides.map((p)=>{
            var cnt_ = this.center.clone()
            var newPostion = NODE.float(params.radius).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            var wp = newPostion;
            if (!params.hasOwnProperty('wp')) {
                params.wp = wp.mul(params.inScale);
              }
            if(this.mapType){
                p.material.colorNode = displacementNormalNoiseFBMWarp.call(params).mul(.5).add(.5)
            }else{
                p.material.colorNode = displacementNoiseFBMWarp.call(params).add(params.scaleHeightOutput)
            }
        })
    }


    buildCube(){
        let qf = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        qf.createQuadTree(1)
        qf.createTiles('front')
        var front = new THREE.Group();
        front.add( ...qf.instances );
        let fmain = this.buildRttMesh(this.w*this.d)
        fmain.position.set(...front.position.toArray())
        fmain.rotation.set(...front.rotation.toArray())

        let qb = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        qb.createQuadTree(1)
        qb.createTiles('back')
        var back = new THREE.Group();
        back.add( ...qb.instances);
        back.position.z = -this.w*this.d;
        back.rotation.y =  Math.PI;
        let bmain       = this.buildRttMesh(this.w*this.d)
        bmain.position.set(...back.position.toArray())
        bmain.rotation.set(...back.rotation.toArray())

        let qr = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        qr.createQuadTree(1)
        qr.createTiles('right')
        var right = new THREE.Group();
        right.add( ...qr.instances );
        right.position.z = -(this.w*this.d)/2;
        right.position.x =  (this.w*this.d)/2;
        right.rotation.y =  Math.PI/2;
        let rmain        = this.buildRttMesh(this.w*this.d)
        rmain.position.set(...right.position.toArray())
        rmain.rotation.set(...right.rotation.toArray())

        let ql = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        ql.createQuadTree(1)
        ql.createTiles('left')
        var left = new THREE.Group();
        left.add( ...ql.instances);
        left.position.z =  -(this.w*this.d)/2;
        left.position.x =  -(this.w*this.d)/2;
        left.rotation.y =  -Math.PI/2;
        let lmain = this.buildRttMesh(this.w*this.d)
        lmain.position.set(...left.position.toArray())
        lmain.rotation.set(...left.rotation.toArray())

        let qt = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        qt.createQuadTree(1)
        qt.createTiles('top')
        var top = new THREE.Group();
        top.add( ...qt.instances);
        top.position.z = -(this.w*this.d)/2;
        top.position.y =  (this.w*this.d)/2;
        top.rotation.x = -Math.PI/2;
        let tmain      = this.buildRttMesh(this.w*this.d)
        tmain.position.set(...top.position.toArray())
        tmain.rotation.set(...top.rotation.toArray())

        let qbo = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        qbo.createQuadTree(1)
        qbo.createTiles('bottom')
        var bottom = new THREE.Group();
        bottom.add( ...qbo.instances);
        bottom.position.z = -(this.w*this.d)/2;
        bottom.position.y = -(this.w*this.d)/2;
        bottom.rotation.x =  Math.PI/2;
        let bomain        = this.buildRttMesh(this.w*this.d)
        bomain.position.set(...bottom.position.toArray())
        bomain.rotation.set(...bottom.rotation.toArray())

        const dummyCube = new THREE.Group();
        const mainCube  = new THREE.Group();

        dummyCube.add(front);
        dummyCube.add(back);
        dummyCube.add(right);
        dummyCube.add(left);
        dummyCube.add(top);
        dummyCube.add(bottom);

        mainCube.add(fmain);
        mainCube.add(bmain);
        mainCube.add(rmain);
        mainCube.add(lmain);
        mainCube.add(tmain);
        mainCube.add(bomain);
        this.center = this.centerPosition(mainCube)
    
        this.mainCubeSides = [
            fmain,
            bmain,
            rmain,
            lmain,
            tmain,
            bomain,
          ]

            return [dummyCube,mainCube]
          }


    build(resoultion=512){
        let  cubes  = this.buildCube()
        let  camera = new THREE.OrthographicCamera( this.w / - 2, this.w / 2, this.h / 2, this.h / - 2, 0, this.d*2 );
        this. cube  = cubes[0]
        this. rtt   = new RtTexture(resoultion)
        this. rtt.initRenderTraget()
        this. rtt.rtCamera = camera.clone()
        this. rtt.rtScene.add(cubes[1])
        }
      

    snapShotFront(download=false){
        let canvases = []
        this.cube.children[0].children.map((e,i)=>{
            this.rtt.rtCamera.position.set(...e.position.toArray());
            this.rtt.snapShot()
            let fpixels = this.rtt.getPixels()
            let fcanvas = this.rtt.toImage(fpixels)
            canvases.push(fcanvas)
        })
        let canvas = displayCanvasesInGrid(canvases,this.d)
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nf`)
            }else{
                this.rtt.download(canvas,`f`)
            }
        }
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        this.rtt.rtCamera.position.set(0,0,0)

    }

    snapShotBack(download=false){
        let position = new THREE.Vector3()
        let canvases = []
        this.cube.children[1].children.map((e,i)=>{
            var cp = position.clone()
            e.getWorldPosition(cp)
            this.rtt.rtCamera.position.set(...cp.toArray());
            this.rtt.rtCamera.rotation.set(0,Math.PI,0);
            this.rtt.snapShot()
            let fpixels = this.rtt.getPixels()
            let fcanvas = this.rtt.toImage(fpixels)
            canvases.push(fcanvas)
        })
        let canvas = displayCanvasesInGrid(canvases,this.d)
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nb`)
            }else{
                this.rtt.download(canvas,`b`)
            }
        }
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }


    snapShotRight(download=false){
        let position = new THREE.Vector3()
        let canvases = []
        this.cube.children[2].children.map((e,i)=>{
            var cp = position.clone()
            e.getWorldPosition(cp)
            this.rtt.rtCamera.position.set(...cp.toArray());
            this.rtt.rtCamera.rotation.set(0,Math.PI/2,0);
            this.rtt.snapShot()
            let fpixels = this.rtt.getPixels()
            let fcanvas = this.rtt.toImage(fpixels)
            canvases.push(fcanvas)
        })
        let canvas = displayCanvasesInGrid(canvases,this.d)
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nr`)
            }else{
                this.rtt.download(canvas,`r`)
            }
        } 
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotLeft(download=false){
        let position = new THREE.Vector3()
        let canvases = []
        this.cube.children[3].children.map((e,i)=>{
            var cp = position.clone()
            e.getWorldPosition(cp)
            this.rtt.rtCamera.position.set(...cp.toArray());
            this.rtt.rtCamera.rotation.set(0,-Math.PI/2,0);
            this.rtt.snapShot()
            let fpixels = this.rtt.getPixels()
            let fcanvas = this.rtt.toImage(fpixels)
            canvases.push(fcanvas)
        })
        let canvas = displayCanvasesInGrid(canvases,this.d)
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nl`)
            }else{
                this.rtt.download(canvas,`l`)
            }
        } 
        this.textuerArray.push( new THREE.CanvasTexture(canvas))
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotTop(download=false){
        let position = new THREE.Vector3()
        let canvases = []
        this.cube.children[4].children.map((e,i)=>{
            var cp = position.clone()
            e.getWorldPosition(cp)
            this.rtt.rtCamera.position.set(...cp.toArray());
            this.rtt.rtCamera.rotation.set(-Math.PI/2,0,0);
            this.rtt.snapShot()
            let fpixels = this.rtt.getPixels()
            let fcanvas = this.rtt.toImage(fpixels)
            canvases.push(fcanvas)
        })
        let canvas = displayCanvasesInGrid(canvases,this.d)
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nt`)
            }else{
                this.rtt.download(canvas,`t`)
            }
        } 
        this.textuerArray.push( new THREE.CanvasTexture(canvas))
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotBottom(download=false){
        let position = new THREE.Vector3()
        let canvases = []
        this.cube.children[5].children.map((e,i)=>{
            var cp = position.clone()
            e.getWorldPosition(cp)
            this.rtt.rtCamera.position.set(...cp.toArray());
            this.rtt.rtCamera.rotation.set(Math.PI/2,0,0);
            this.rtt.snapShot()
            let fpixels = this.rtt.getPixels()
            let fcanvas = this.rtt.toImage(fpixels)
            canvases.push(fcanvas)
        })
        let canvas = displayCanvasesInGrid(canvases,this.d)
        if(download){
            if(this.mapType){
                this.rtt.download(canvas,`nbo`)
            }else{
                this.rtt.download(canvas,`bo`)
            }
        } 
        this.textuerArray.push(new THREE.CanvasTexture(canvas))
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }


    snapShot(download=false){
        this.snapShotFront (download)
        this.snapShotBack  (download)
        this.snapShotRight (download)
        this.snapShotLeft  (download)
        this.snapShotTop   (download)
        this.snapShotBottom(download)
    }

}

/*
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
    */