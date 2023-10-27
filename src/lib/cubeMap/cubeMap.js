
import * as THREE  from 'three'
import * as NODE   from 'three/nodes';
import Quad        from './../PlanetTech/engine/quad';
import {RtTexture} from './rTtexture'
import { displayCanvasesInGrid } from './utils';
//import {snoise,normals, sdfbm2,} from '../../shaders/analyticalNormals';
import * as Shaders  from  './../PlanetTech/shaders/index.js'





let f2 = NODE.glslFn(`
vec3 normalMap(vec3 n1_,vec3 n2_){
    vec3 n1 = n1_*2.-1.;
    vec3 n2 = n2_*2.-1.;

    float a = 1./(1. + n1.z);
    float b = -n1.x*n1.y*a;
    
    // Form a basis
    vec3 b1 = vec3(1. - n1.x*n1.x*a, b, -n1.x);
    vec3 b2 = vec3(b, 1. - n1.y*n1.y*a, -n1.y);
    vec3 b3 = n1;
    
    if (n1.z < -0.9999999) // Handle the singularity
    {
        b1 = vec3( .0, -1., .0);
        b2 = vec3(-1.,  .0, .0);
    }
    
    // Rotate n2 via the basis
    vec3 r = n2.x*b1 + n2.y*b2 + n2.z*b3;
    
    return r*.5+.5;
}
`)


const displace = (tex,uv) =>{
    return NODE.texture(tex,uv)
   }
const textureNormal = (tangent,bitangent,position, normal, texture, vUv) =>{
      let displacedPosition = normal.mul(displace(texture,vUv)).add(position)
      let texelSize = .005; // temporarily hardcoding texture resolution
      let offset = 0.09;
      let neighbour1 = tangent.mul(offset).add(position)
      let neighbour2 = bitangent.mul(offset).add(position)
      let neighbour1uv = vUv.add(NODE.vec2(-texelSize,0))
      let neighbour2uv = vUv.add(NODE.vec2(0,-texelSize))
      let displacedNeighbour1 = normal.mul(displace(texture,neighbour1uv)).add(neighbour1)
      let displacedNeighbour2 = normal.mul(displace(texture,neighbour2uv)).add(neighbour2)
      let displacedTangent = displacedNeighbour1.sub(displacedPosition)
      let displacedBitangent = displacedNeighbour2.sub(displacedPosition)
      let displacedNormal = NODE.normalize(NODE.cross(displacedTangent, displacedBitangent));
      return displacedNormal.mul(0.5).add(0.5);
    }

    const textureNormal1 = (cubeText,vUV,scale,strength,eps)=>{    
        let center = NODE.texture(cubeText, vUV).r;
        let dx = NODE.texture(cubeText, vUV.add(NODE.vec3(eps,.0,.0))).r.sub(center);  
        let dy = NODE.texture(cubeText, vUV.add(NODE.vec3(.0,eps,.0))).r.sub(center); 
        //let dz = NODE.cubeTexture(cubeText, vUV.add(NODE.vec3(.0,0,eps))).r.sub(center);  
     
        let normalMap = NODE.vec3(dx.mul(scale), dy.mul(scale), 1.).normalize();  
        normalMap = normalMap.mul(strength);                            
        return normalMap.mul(0.5).add(0.5);
    }
    

    const textureNormal2 = (cubeText,vUV,scale,strength,eps)=>{    
        let center = NODE.texture(cubeText, vUV).r;
        let dx = NODE.texture(cubeText, vUV.add(NODE.vec3(eps,.0,.0))).r.sub(center);  
        let dy = NODE.texture(cubeText, vUV.add(NODE.vec3(.0,eps,.0))).r.sub(center); 
        //let dz = NODE.cubeTexture(cubeText, vUV.add(NODE.vec3(.0,0,eps))).r.sub(center);  
     
        let normalMap = NODE.vec3(dx.mul(scale), dy.mul(scale), 1.).normalize();  
        normalMap = normalMap.mul(strength);                            
        return normalMap.mul(0.5).add(0.5);
    }
    


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
        //material.colorNode = NODE.vec3(0,0,0)
        const plane    = new THREE.Mesh( geometry, material );
        plane.geometry.computeTangents()
        return plane
      }


    addTexture(face,texture){
        /*params.vn = NODE.normalLocal
        params.tangent = NODE.tangentLocal*/
        let p = this.mainCubeSides[face]
        var cnt_ = this.center.clone()
        var newPostion = NODE.positionWorld//NODE.float(100).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
        /*
        var cnt_ = this.center.clone()
        var newPostion = NODE.float(params.radius).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
        var wp = newPostion;
        let uvScale = params.uvScale
        if (!params.hasOwnProperty('wp')) {
            params.wp = wp.mul(params.inScale);
            }*/
        if(this.mapType){
            if(p.material.colorNode){
                let uv = Shaders.uvTransforms(8.)     
                let t1 = p.material.colorNode
                let t2 = NODE.clamp(NODE.texture(texture,uv),0,1).sub(.01) 
                let t3 = t2.mul(Shaders.blackToWhiteGradient({radius:.5,vUv:uv}))
                p.material.colorNode = NODE.clamp(t1.sub(t3),0,1).add(t3)
            }else{
                let uv = Shaders.uvTransforms(8.) 
                let t1 = NODE.texture(texture,uv)// textureNormal2 (texture,uv,.5,1.,.001) //Shaders.snoise3DDisplacementNormalFBM(params)    //tangent,bitangent,position, normal, texture, vUv
                let t2 = t1.mul(Shaders.blackToWhiteGradient({radius:.5,vUv:uv}))
                p.material.colorNode = t2
            }
        }else{
            if(p.material.colorNode){
                /*
                let uv = Shaders.uvTransforms(uvScale)     
                let t1 = p.material.colorNode
                let t2 = NODE.clamp(Shaders.displacementFBM(params).add(params.scaleHeightOutput),0., 1.)
                let t3 = t2.mul(Shaders.blackToWhiteGradient({radius:params.fallOfRadius,vUv:uv}))
                p.material.colorNode = t3.add(t1) 
                */
            }else{
                let uv = Shaders.uvTransforms(8.) 
                let t1 = NODE.texture(texture,uv)// textureNormal2 (texture,uv,.5,1.,.001) //Shaders.snoise3DDisplacementNormalFBM(params)    //tangent,bitangent,position, normal, texture, vUv
                let t2 = t1.mul(Shaders.blackToWhiteGradient({radius:.5,vUv:uv}))
                p.material.colorNode = t2
            }
        }
    }


    simplexNoise(params){
        params.vn = NODE.normalLocal 
        params.tangent = NODE.tangentLocal
        this.mainCubeSides.map((p)=>{
            var cnt_ = this.center.clone()
            var newPostion = NODE.float(params.radius).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
            p.material.colorNode = Shaders.snoise3D({v:newPostion.mul(params.scale)})
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
                if(p.material.colorNode){
                    let t1 = p.material.colorNode
                    let t2 = Shaders.snoise3DDisplacementNormalFBM(params).mul(.5).add(.5)//.mul(2).add(1)
                    p.material.colorNode = f2({n1_:t1,n2_:t2})//t1.add(t2).normalize().mul(.5).add(.5)
                }else{
                    p.material.colorNode = Shaders.snoise3DDisplacementNormalFBM(params).mul(.5).add(.5)//.mul(2).sub(1)
                }
            }else{
                if(p.material.colorNode){
                    let t1 = p.material.colorNode
                    let t2 = NODE.clamp(Shaders.displacementFBM(params).add(params.scaleHeightOutput),0., 1.)
                    p.material.colorNode = NODE.mix(t2,t1,t1.a)
                }else{
                    p.material.colorNode =  NODE.clamp(Shaders.displacementFBM(params).add(params.scaleHeightOutput),0., 1.) //Shaders.displacementFBM(params).add(params.scaleHeightOutput)
                }
            }
        })
    }


    fallOffNoise(face,params){
        params.vn = NODE.normalLocal
        params.tangent = NODE.tangentLocal
        let p = this.mainCubeSides[face]
        var cnt_ = this.center.clone()
        var newPostion = NODE.float(params.radius).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
        var wp = newPostion;
        let uvScale = params.uvScale
        if (!params.hasOwnProperty('wp')) {
            params.wp = wp.mul(params.inScale);
            }
        if(this.mapType){
            if(p.material.colorNode){
                let uv = Shaders.uvTransforms(uvScale)     
                let t1 = p.material.colorNode
                let t2 = Shaders.snoise3DDisplacementNormalFBM(params)
                let t3 = t2.mul(Shaders.blackToWhiteGradient({radius:params.fallOfRadius,vUv:uv}))
                p.material.colorNode = t3.add(t1)
            }else{
                let uv = Shaders.uvTransforms(uvScale) 
                let t1 = Shaders.snoise3DDisplacementNormalFBM(params)    
                let t2 = t1.mul(Shaders.blackToWhiteGradient({radius:params.fallOfRadius,vUv:uv}))
                p.material.colorNode = t2
            }
        }else{
            if(p.material.colorNode){
                let uv = Shaders.uvTransforms(uvScale)     
                let t1 = p.material.colorNode
                let t2 = NODE.clamp(Shaders.displacementFBM(params).add(params.scaleHeightOutput),0., 1.)
                let t3 = t2.mul(Shaders.blackToWhiteGradient({radius:params.fallOfRadius,vUv:uv}))
                p.material.colorNode = t3.add(t1) 
            }else{
                let uv = Shaders.uvTransforms(uvScale)     
                let t1 = NODE.clamp(Shaders.displacementFBM(params).add(params.scaleHeightOutput),0., 1.) 
                let t2 = t1.mul(Shaders.blackToWhiteGradient({radius:params.fallOfRadius,vUv:uv}))
                p.material.colorNode = t2
            }
        }
    }


    mix(color){
        this.mainCubeSides.map((p)=>{
            let t1 = p.material.colorNode
            p.material.colorNode = NODE.mix(color, t1, t1.a)
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
                if(p.material.colorNode){
                    let t1 = p.material.colorNode
                    let t2 = Shaders.displacementNormalNoiseFBMWarp(params).mul(.5).add(.5)//.mul(2).add(1)
                    p.material.colorNode = f2({n1_:t1,n2_:t2})//t1.add(t2).normalize().mul(.5).add(.5)
                }else{
                    p.material.colorNode = Shaders.displacementNormalNoiseFBMWarp(params).mul(.5).add(.5)//.mul(2).sub(1)
                }
            }else{
                if(p.material.colorNode){
                    let t1 = p.material.colorNode
                    let t2 = NODE.clamp(Shaders.displacementNoiseFBMWarp(params).add(params.scaleHeightOutput),0., 1.)
                    p.material.colorNode = NODE.mix(t2,t1,t1.a)
                }else{
                    p.material.colorNode =  NODE.clamp(Shaders.displacementNoiseFBMWarp(params).add(params.scaleHeightOutput),0., 1.) //Shaders.displacementFBM(params).add(params.scaleHeightOutput)
                }
            }

        })
    }
    defNoise(params,callBack){
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
                if(p.material.colorNode){
                    let t1 = p.material.colorNode
                    let t2 = Shaders.customNoiseNormal(callBack)(params).mul(.5).add(.5)
                    p.material.colorNode = f2({n1_:t1,n2_:t2})
                }else{
                    p.material.colorNode = Shaders.customNoiseNormal(callBack)(params).mul(.5).add(.5)
                }
            }else{
                if(p.material.colorNode){
                    let t1 = p.material.colorNode
                    let t2 = NODE.clamp(Shaders.displacementNoiseFBMWarp(params).add(params.scaleHeightOutput),0., 1.)
                    p.material.colorNode = NODE.mix(t2,t1,t1.a)
                }else{
                    p.material.colorNode =  NODE.clamp(Shaders.displacementNoiseFBMWarp(params).add(params.scaleHeightOutput),0., 1.) 
                }
            }

        })  
    }


    invert(){
        this.mainCubeSides.map((p)=>{
            let t1 = p.material.colorNode
            p.material.colorNode = NODE.float(1).sub(t1)
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


    build(resoultion=512,renderer){
        let  cubes  = this.buildCube()
        let  camera = new THREE.OrthographicCamera( this.w / - 2, this.w / 2, this.h / 2, this.h / - 2, 0, this.d*2 );
        this. cube  = cubes[0]
        this. rtt   = new RtTexture(resoultion,renderer)
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
        this.snapShotRight (download)
        this.snapShotLeft  (download)
        this.snapShotTop   (download)
        this.snapShotBottom(download)
        this.snapShotFront (download)
        this.snapShotBack  (download)
    }

}