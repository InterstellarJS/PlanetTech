import * as THREEWG from 'three/nodes';
import * as THREE   from 'three';
import Quad         from './quad'
import {QuadTrees}    from './quadtree'



export default class Sphere{
  constructor(w,h,ws,hs,d) {
      this.w  = w
      this.h  = h
      this.ws = ws
      this.hs = hs
      this.d  = d
      this.sphere = new THREE.Group();
      this.bbox   = new THREE.Box3();
      this. quadTreeconfig = QuadTrees.QuadTreeLoDCore
    }

    position(x,y,z){
      this.quadTreeconfig.shardedData.position = {x,y,z}
      this.sphere.position.set(x,y,z)
      var bbox   = new THREE.Box3();
      bbox.expandByObject(this.sphere);
      var center = new THREE.Vector3();
      bbox.getCenter(center);
      var cnt = center
      this.front. quadTreeconfig.config['cnt'] = cnt.clone()
      this.back.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.right. quadTreeconfig.config['cnt'] = cnt.clone()
      this.left.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.top.   quadTreeconfig.config['cnt'] = cnt.clone()
      this.bottom.quadTreeconfig.config['cnt'] = cnt.clone()

    }

    scale(s){
      this.quadTreeconfig.shardedData.scale = s
      this. sphere.scale.set(s,s,s)
      var bbox   = new THREE.Box3();
      bbox.expandByObject(this.sphere);
      var center = new THREE.Vector3();
      bbox.getCenter(center);
      var cnt = center
      this.front. quadTreeconfig.config['cnt'] = cnt.clone()
      this.back.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.right. quadTreeconfig.config['cnt'] = cnt.clone()
      this.left.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.top.   quadTreeconfig.config['cnt'] = cnt.clone()
      this.bottom.quadTreeconfig.config['cnt'] = cnt.clone()

    }
  

  build(lvl,radius, displacmentScale, color=this.quadTreeconfig.shardedData.color){
    this.quadTreeconfig.shardedData.radius = radius 
    this.quadTreeconfig.shardedData.color  = color
    this.quadTreeconfig.shardedData.displacmentScale = displacmentScale


    this.front = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.front.createQuadTree(lvl)
    this.front.createDimensions('front')
    var front = new THREE.Group();

    this.back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.back.createQuadTree(lvl)
    this.back.createDimensions('back')
    var back = new THREE.Group();
    back.position.z = -this.w*this.d;
    back.rotation.y =  Math.PI;

    this.right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.right.createQuadTree(lvl)
    this.right.createDimensions('right')
    var right = new THREE.Group();
    right.position.z = -(this.w*this.d)/2;
    right.position.x =  (this.w*this.d)/2;
    right.rotation.y =  Math.PI/2;

    this.left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.left.createQuadTree(lvl)
    this.left.createDimensions('left')
    var left = new THREE.Group();
    left.position.z =  -(this.w*this.d)/2;
    left.position.x =  -(this.w*this.d)/2;
    left.rotation.y =  -Math.PI/2;

    this.top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.top.createQuadTree(lvl)
    this.top.createDimensions('top')
    var top = new THREE.Group();
    top.position.z = -(this.w*this.d)/2;
    top.position.y =  (this.w*this.d)/2;
    top.rotation.x = -Math.PI/2;

    this.bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.bottom.createQuadTree(lvl)
    this.bottom.createDimensions('bottom')
    var bottom = new THREE.Group();
    bottom.position.z = -(this.w*this.d)/2;
    bottom.position.y = -(this.w*this.d)/2;
    bottom.rotation.x =  Math.PI/2;

    this.sphere.add(front);
    this.sphere.add(back);
    this.sphere.add(right);
    this.sphere.add(left);
    this.sphere.add(top);
    this.sphere.add(bottom);

    const copyFunc = (x) =>{
      return x.plane
    }

    front.add (...this.front .instances.map(copyFunc));
    back.add  (...this.back  .instances.map(copyFunc));
    right.add (...this.right .instances.map(copyFunc));
    left.add  (...this.left  .instances.map(copyFunc));
    top.add   (...this.top   .instances.map(copyFunc));
    bottom.add(...this.bottom.instances.map(copyFunc));

    var cnt = this.centerPosition()

    let allp = [
      ...this.front.instances,
      ...this.back.instances,
      ...this.right.instances,
      ...this.left.instances,
      ...this.top.instances,
      ...this.bottom.instances,
      ]


    let v3 = new THREE.Vector3();
    let localCenter = new THREE.Vector3();

    allp.map((e_)=>{
      //GPU------
      let e = e_.plane
      var cnt_ = cnt.clone()
      console.log(cnt_)      
      e.worldToLocal(cnt_)
      var ps = THREEWG.float(radius).mul((THREEWG.positionLocal.sub(cnt_).normalize())).add(cnt_) 
      e.material.positionNode = ps
      e.material.colorNode    = color instanceof Function ? color() : color
      //CPU------
      let CPUe = e_.CPUplane
      CPUe.worldToLocal(localCenter.copy(cnt.clone()));
      let pos = CPUe.geometry.attributes.position;
      for(let i = 0; i < pos.count; i++){
        v3.fromBufferAttribute(pos, i);
        v3.sub(localCenter);
        v3.setLength(radius).add(localCenter);
        pos.setXYZ(i, v3.x, v3.y, v3.z);
      }
      CPUe.geometry.computeVertexNormals();
      pos.needsUpdate = true;

      let wp = new THREE.Vector3()
      let wq = new THREE.Quaternion()
      e_.plane.getWorldPosition(wp)
      e_.plane.getWorldQuaternion(wq);
      CPUe.position.copy(wp)
      CPUe.quaternion.copy(wq)
      })
      
      this.front. quadTreeconfig.config['cnt'] = cnt.clone()
      this.back.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.right. quadTreeconfig.config['cnt'] = cnt.clone()
      this.left.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.top.   quadTreeconfig.config['cnt'] = cnt.clone()
      this.bottom.quadTreeconfig.config['cnt'] = cnt.clone()
        }

  log(){
    return this.quadTreeconfig.shardedData
  }

  centerPosition() {
      this.bbox.expandByObject(this.sphere);
      var center = new THREE.Vector3();
      this.bbox.getCenter(center);
      return center
    }

}