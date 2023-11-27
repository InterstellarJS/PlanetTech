
import * as THREE  from 'three'
import * as NODE   from 'three/nodes';
import Quad        from './../PlanetTech/engine/quad';
import {RtTexture} from './rTtexture'
import { displayCanvasesInGrid } from './utils';
import * as Shaders  from  './../PlanetTech/shaders/index.js'

let f2 = NODE.glslFn(`
vec3 blend_whiteout(vec3 n1_,vec3 n2_){
    vec3 r = (n1_ + n2_)*2. - 2.;
    return normalize(r)*.5+.5;
}
`)


let blend_udn = NODE.glslFn(`
vec3 blend_udn(vec3 n1_, vec3 n2_){
    vec3 n1 = n1_.xyz*2.0-1.0;
    vec3 n2 = n2_.xyz*2.0-1.0;
    vec3 n  = normalize(vec3(n1.xy + n2.xy, n1.z));
    return n * 0.5 + 0.5;
    }
`)


export class TileMap{
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
        plane.geometry.computeTangents()
        return plane
      }

    addTextures(textureArray){
        this.mainCubeSides.forEach((p,i) => {
            let uv = NODE.uv() 
            let t1 = NODE.texture(textureArray[i],uv)
            p.material.colorNode = t1
        });
    }

    addTexture(idx,texture){
        let p = this.mainCubeSides[idx]
        let uv = NODE.uv() 
        let t  = NODE.texture(texture,uv)
        p.material.colorNode = t
    }

    addMask(params,textureArray){
        this.mainCubeSides.forEach((p,i) => {
            let uv = Shaders.uvTransforms(params.scale,NODE.vec2(params.offsetX,params.offsetY))
            let t1 = NODE.texture(textureArray[i],uv)
            let t2 = p.material.colorNode
            p.material.colorNode = blend_udn({n1_:t2,n2_:t1})
        });
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
            rmain,
            lmain,
            tmain,
            bomain,
            fmain,
            bmain,
          ]

            return [dummyCube,mainCube]
          }


    build(resoultion=512,renderer){
        let  cubes  = this.buildCube()
        let  camera = new THREE.OrthographicCamera( this.w / - 2, this.w / 2, this.h / 2, this.h / - 2, 0, this.d*2 );
        this. cube  = cubes[0]
        this. rtt   = new RtTexture(resoultion,renderer)
        this. rtt.initRenderTraget()
        this. rtt.rtCamera = camera.clone()
        this. rtt.rtScene.add(cubes[1])
        }
      

    snapShotFront(download=false,downloadTiles=false){
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
                this.rtt.download(canvas,`front/normal`)
            }else{
                this.rtt.download(canvas,`front/displacement`)
            }
        }
        if(downloadTiles){
            if(this.mapType){
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/front/normal`)
                })
            }else{
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/front/displacement`)
                })
            }
        }
        this.textuerArray.push(canvas)
        this.rtt.rtCamera.position.set(0,0,0)
    }

    snapShotBack(download=false,downloadTiles=false){
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
                this.rtt.download(canvas,`back/normal`)
            }else{
                this.rtt.download(canvas,`back/displacement`)
            }
        }
        if(downloadTiles){
            if(this.mapType){
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/back/normal`)
                })
            }else{
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/back/displacement`)
                })
            }
        }
        this.textuerArray.push(canvas)
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotRight(download=false,downloadTiles=false){
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
                this.rtt.download(canvas,`right/normal`)
            }else{
                this.rtt.download(canvas,`right/displacement`)
            }
        }
        if(downloadTiles){
            if(this.mapType){
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/right/normal`)
                })
            }else{
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/right/displacement`)
                })
            }
        }
        this.textuerArray.push(canvas)
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotLeft(download=false,downloadTiles=false){
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
                this.rtt.download(canvas,`left/normal`)
            }else{
                this.rtt.download(canvas,`left/displacement`)
            }
        }
        if(downloadTiles){
            if(this.mapType){
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/left/normal`)
                })
            }else{
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/left/displacement`)
                })
            }
        }
        this.textuerArray.push( canvas)
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotTop(download=false,downloadTiles=false){
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
                this.rtt.download(canvas,`top/normal`)
            }else{
                this.rtt.download(canvas,`top/displacement`)
            }
        }
        if(downloadTiles){
            if(this.mapType){
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/top/normal`)
                })
            }else{
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/top/displacement`)
                })
            }
        }
        this.textuerArray.push(canvas)
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShotBottom(download=false,downloadTiles=false){
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
                this.rtt.download(canvas,`bottom/normal`)
            }else{
                this.rtt.download(canvas,`bottom/displacement`)
            }
        }
        if(downloadTiles){
            if(this.mapType){
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/bottom/normal`)
                })
            }else{
                canvases.forEach((e,i)=>{
                    this.rtt.download(e,`${i}/bottom/displacement`)
                })
            }
        }
        this.textuerArray.push(canvas)
        this.rtt.rtCamera.position.set(0,0,0)
        this.rtt.rtCamera.rotation.set(0,0,0)
    }

    snapShot(download=false,downloadTiles=false){
        // images are downloaded in col order
        this.snapShotRight (download,downloadTiles)
        this.snapShotLeft  (download,downloadTiles)
        this.snapShotTop   (download,downloadTiles)
        this.snapShotBottom(download,downloadTiles)
        this.snapShotFront (download,downloadTiles)
        this.snapShotBack  (download,downloadTiles)
    }

}