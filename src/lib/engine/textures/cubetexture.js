import * as THREE  from 'three'
import {RtTexture} from './rTtexture'
import renderer    from '../../render'
import * as NODE from 'three/nodes';
import {fbmNoise,displacemntNormalV3,snoise3D,displacementNormalNoiseFBM} from  './../shaders/glslFunctions'
import {snoise,normals} from  './../shaders/analyticalNormals'

console.log(NODE)

  export class CubeTexture{
    constructor(){
  
    }
  
    centerPosition(c) {
      var bbox  = new THREE.Box3();
      bbox.expandByObject(c);
      var center = new THREE.Vector3();
      bbox.getCenter(center);
      return center
    }
  
    buildRttMesh(size){
      var rtt = new RtTexture(size)
      rtt.initRenderTraget()
      var m = rtt.toMesh(2, 2, 10, 10)
      return [rtt,m]
    }

    displacementToNormal(t,size,rend){
      var cp = new THREE.Vector3()
      var cr = new THREE.Vector3(0,0,0)
      var nrtt = new RtTexture(size)
      nrtt.initRenderTraget()
      var nm = nrtt.toMesh(2, 2, 10, 10)
      nrtt.rtCamera.position.set(cp.x,cp.y,cp.z);
      nrtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
      nrtt.rtScene.add(nm.clone())
      nm.material.colorNode = displacemntNormalV3(t,NODE.uv()) 
      var t = nrtt.getTexture()
      nrtt.snapShot(rend)
      return t
    }
  
  
  get(){
  
    var rend = renderer
    var ts = []
    var cube = new THREE.Group()
    
    this. w = 2
    this. d = 1
  
  
    //----
   var size = 512
   const [frtt,fmg] = this.buildRttMesh(size)
   const [brtt,bmg] = this.buildRttMesh(size)
   bmg.position.z = -this.w*this.d;
   bmg.rotation.y =  Math.PI;
   const [rrtt,rmg] = this.buildRttMesh(size)
   rmg.position.z = -(this.w*this.d)/2;
   rmg.position.x =  (this.w*this.d)/2;
   rmg.rotation.y =  Math.PI/2;
   const [lrtt,lmg] = this.buildRttMesh(size)
   lmg.position.z =  -(this.w*this.d)/2;
   lmg.position.x =  -(this.w*this.d)/2;
   lmg.rotation.y =  -Math.PI/2;
   const [trtt,tmg] = this.buildRttMesh(size)
   tmg.position.z = -(this.w*this.d)/2;
   tmg.position.y =  (this.w*this.d)/2;
   tmg.rotation.x = -Math.PI/2;
   const [bortt,bomg] = this.buildRttMesh(size)
   bomg.position.z = -(this.w*this.d)/2;
   bomg.position.y = -(this.w*this.d)/2;
   bomg.rotation.x =  Math.PI/2;
  
  cube.add(fmg);
  cube.add(bmg);
  cube.add(rmg);
  cube.add(lmg);
  cube.add(tmg);
  cube.add(bomg);
  
  
    let allp = [
      fmg,
      bmg,
      rmg,
      lmg,
      tmg,
      bomg,
    ]
  console.log(allp)
    var cnt = this.centerPosition(cube)
  
    for (let index = 0; index < allp.length; index++) {
      const element = allp[index];
      var cnt_ = cnt.clone()
      element.worldToLocal(cnt_)
      var newPostion = NODE.float(100.0).mul((NODE.positionWorld.sub(cnt_).normalize())).add(cnt_) 
      var wp = (NODE.modelViewMatrix.mul(NODE.vec4(newPostion,1.0))).xyz;
      //var n1  = displacementNormalNoiseFBM.call
      //tangentNorm

      /*var n1  = displacementNormalNoiseFBM.call({
        wp:wp,vn:NODE.normalLocal,
        seed0:1.0, scale0:5.3, postionScale0:.08, persistance0:2.0, lacunarity0:0.5, redistribution0:1.0, octaves0:4, iteration0:5, terbulance0:true, ridge0:true,
        seed1:1.0, scale1:5.3, postionScale1:.08, persistance1:2.0, lacunarity1:0.5, redistribution1:1.0, octaves1:4, iteration1:5, terbulance1:true, ridge1:true,
        seed2:1.0, scale2:5.3, postionScale2:.08, persistance2:2.0, lacunarity2:0.5, redistribution2:1.0, octaves2:4, iteration2:5, terbulance2:true, ridge2:true,
      }) 

      var n2  = displacementNormalNoiseFBM.call({
        wp:wp,vn:NODE.normalLocal,
        seed0:10.0, scale0:15.3, postionScale0:.08, persistance0:2.0, lacunarity0:0.5, redistribution0:1.0, octaves0:8, iteration0:5, terbulance0:true, ridge0:true,
        seed1:6.0, scale1:0.5, postionScale1:.08, persistance1:2.0, lacunarity1:0.5, redistribution1:2.0, octaves1:4, iteration1:500, terbulance1:true, ridge1:false,
        seed2:5.0, scale2:5.3, postionScale2:.08, persistance2:1.8, lacunarity2:0.5, redistribution2:1.0, octaves2:8, iteration2:500, terbulance2:true, ridge2:true,
      })*/

      /*var n1 = fbmNoise.call({
        v_:wp.mul(.5).add(NODE.normalLocal), seed_:6.0, scale_:0.3,  persistance_:2.0, lacunarity_:0.5, redistribution_:2.0, octaves_:4, iteration_:5, terbulance_:false, ridge_:false,
      }) 
      var n2 = fbmNoise.call({
        v_:wp.mul(.5).add(NODE.normalLocal), seed_:89.0, scale_:0.3,  persistance_:2.0, lacunarity_:0.5, redistribution_:2.0, octaves_:4, iteration_:5, terbulance_:true, ridge_:false,
      })*/ 

      var n1 = fbmNoise.call({
        v_:wp.mul(.1).add(NODE.normalLocal), seed_:6.0, scale_:0.3,  persistance_:2.0, lacunarity_:0.5, redistribution_:2.0, octaves_:4, iteration_:5, terbulance_:false, ridge_:false,
      }) 

      var sampleDir = wp.xyz.sub(cnt_).normalize();
      var grad = NODE.vec3(0.)
      var noisegrad = snoise.call({v:sampleDir,gradient:grad})

      var n1  = displacementNormalNoiseFBM.call({
        wp:wp,vn:NODE.normalLocal,
        seed0:1.0, scale0:0.3, postionScale0:.08, persistance0:2.0, lacunarity0:0.5, redistribution0:1.0, octaves0:4, iteration0:5, terbulance0:true, ridge0:true,
        seed1:1.0, scale1:0.3, postionScale1:.08, persistance1:2.0, lacunarity1:0.5, redistribution1:1.0, octaves1:4, iteration1:5, terbulance1:true, ridge1:true,
        seed2:1.0, scale2:0.3, postionScale2:.08, persistance2:2.0, lacunarity2:0.5, redistribution2:1.0, octaves2:4, iteration2:5, terbulance2:true, ridge2:true,
      }) 


      element.material.colorNode =n1//normals.call({grad:noisegrad.yzw,sampleDir:sampleDir}) 
    }

    var cp = new THREE.Vector3()
    var cr = new THREE.Vector3(0,0,0)
    cube.children[0].getWorldPosition(cp)
  
    frtt.rtCamera.position.set(cp.x,cp.y,cp.z);
    frtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
    frtt.rtScene.add(cube.clone())
    var t = frtt.getTexture()
    frtt.snapShot(rend)

    //var pixels = frtt.getPixels(rend)
    //var canvas = frtt.toImage(pixels)
    //frtt.download(canvas,'FG')
    ts.push([t])
  
  var cp = new THREE.Vector3()
  var cr = new THREE.Vector3(0,-Math.PI,0)
  cube.children[1].getWorldPosition(cp)
  brtt.rtCamera.position.set(cp.x,cp.y,cp.z);
  brtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
  brtt.rtScene.add(cube.clone())
  var t = brtt.getTexture()
  brtt.snapShot( rend)

  
 // var pixels = brtt.getPixels(rend)
 // var canvas = brtt.toImage(pixels)
 // brtt.download(canvas,'BAG')
  ts.push([t])
  //----------
  var cp = new THREE.Vector3()
  var cr = new THREE.Vector3(0,Math.PI/2,0)
  cube.children[2].getWorldPosition(cp)
  rrtt.rtCamera.position.set(cp.x,cp.y,cp.z);
  rrtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
  rrtt.rtScene.add(cube.clone())
  var t = rrtt.getTexture()
  rrtt.snapShot( rend)
  
 // var pixels = rrtt.getPixels(rend)
 // var canvas = rrtt.toImage(pixels)
//  rrtt.download(canvas,'RG')
  
  ts.push([t])
  //----------
  var cp = new THREE.Vector3()
  var cr = new THREE.Vector3(0,-Math.PI/2,0)
  cube.children[3].getWorldPosition(cp)
  lrtt.rtCamera.position.set(cp.x,cp.y,cp.z);
  lrtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
  lrtt.rtScene.add(cube.clone())
  var t = lrtt.getTexture()
  lrtt.snapShot( rend)

    

 // var pixels = lrtt.getPixels(rend)
 // var canvas = lrtt.toImage(pixels)
 // lrtt.download(canvas,'LG')
  
  ts.push([t])
  //----------
  var cp = new THREE.Vector3()
  var cr = new THREE.Vector3(-Math.PI/2,0,0)
  cube.children[4].getWorldPosition(cp)
  trtt.rtCamera.position.set(cp.x,cp.y,cp.z);
  trtt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
  trtt.rtScene.add(cube.clone())
  var t = trtt.getTexture()
  trtt.snapShot( rend)

    

  //var pixels = trtt.getPixels(rend)
  //var canvas = trtt.toImage(pixels)
  //trtt.download(canvas,'TG')
  
  ts.push([t])
  //----------
  var cp = new THREE.Vector3()
  var cr = new THREE.Vector3(Math.PI/2,0,0)
  cube.children[5].getWorldPosition(cp)
  bortt.rtCamera.position.set(cp.x,cp.y,cp.z);
  bortt.rtCamera.rotation.set(cr.x,cr.y,cr.z) 
  bortt.rtScene.add(cube.clone())
  var t = bortt.getTexture()
  bortt.snapShot( rend)

  //var pixels = bortt.getPixels(rend)
  //var canvas = bortt.toImage(pixels)
  //bortt.download(canvas,'BG')
  ts.push([t])
  
  
  return ts
  }
  
  
  }