import * as NODE from 'three/nodes';
import * as THREE   from 'three';
import Quad         from '../engine/quad'
import {QuadTrees}  from '../engine/quadtree'
import { hexToRgbA,getRandomColor } from '../engine/utils';


function project( v, r, center ){
	v.sub( center ).setLength( r ).add( center );
}

export default class Sphere{
  constructor(w,h,ws,hs,d) {
    this.w  = w
    this.h  = h
    this.ws = ws
    this.hs = hs
    this.d  = d
    this.bbox   = new THREE.Box3()
    this.quadTreeconfig = new QuadTrees.QuadTreeLoDCore()
    }

  build(
    lvl,
    radius, 
    displacmentScale  = this.quadTreeconfig.config.displacmentScale, 
    lodDistanceOffset = this.quadTreeconfig.config.lodDistanceOffset, 
    material          = this.quadTreeconfig.config.material, 
    color             = this.quadTreeconfig.config.color
    ){
    
    this.quadTreeconfig.config.radius   = radius 
    this.quadTreeconfig.config.color    = color
    this.quadTreeconfig.config.material = material
    this.quadTreeconfig.config.displacmentScale  = displacmentScale
    this.quadTreeconfig.config.lodDistanceOffset = lodDistanceOffset

    Object.assign(this.quadTreeconfig.config,{
      maxLevelSize:  this.w,
      minLevelSize:  Math.floor(this.w/Math.pow(2,lvl-1)), // this create a vizual bug when not divisible pay 2 
      minPolyCount:  this.ws,
      dimensions:    this.d,
      }
    )
    this.quadTreeconfig.levels(lvl)
    this.quadTreeconfig.createArrayBuffers()
    this.quadTreeconfig.getCenter()

    this. sphere = new THREE.Group()

    let right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    right.createDimensions('right')
    var rightGroup = new THREE.Group()
    rightGroup.position.z = -(this.w*this.d)/2;
    rightGroup.position.x =  (this.w*this.d)/2;
    rightGroup.rotation.y =  Math.PI/2;
    rightGroup.add( ...right.instances.map(x=>x.plane) );
    this.sphere.add(rightGroup)

    let left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    left.createDimensions('left')
    var leftGroup = new THREE.Group();
    leftGroup.add( ...left.instances.map(x=>x.plane) );
    leftGroup.position.z =  -(this.w*this.d)/2;
    leftGroup.position.x =  -(this.w*this.d)/2;
    leftGroup.rotation.y =  -Math.PI/2;
    this.sphere.add(leftGroup)


    let top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    top.createDimensions('top')
    var topGroup = new THREE.Group();
    topGroup.add( ...top.instances.map(x=>x.plane) );
    topGroup.position.z = -(this.w*this.d)/2;
    topGroup.position.y =  (this.w*this.d)/2;
    topGroup.rotation.x = -Math.PI/2;
    this.sphere.add(topGroup)

    let bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    bottom.createDimensions('bottom')
    var bottomGroup = new THREE.Group();
    bottomGroup.add( ...bottom.instances.map(x=>x.plane) );
    bottomGroup.position.z = -(this.w*this.d)/2;
    bottomGroup.position.y = -(this.w*this.d)/2;
    bottomGroup.rotation.x =  Math.PI/2;
    this.sphere.add(bottomGroup)


    let front  = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    front.createDimensions('front')
    let frontGroup = new THREE.Group()
    frontGroup.add(...front.instances.map(x=>x.plane))
    this.sphere.add(frontGroup)
    

    let back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    back.createDimensions('back')
    var backGroup = new THREE.Group();
    backGroup.add( ...back.instances.map(x=>x.plane) );
    backGroup.position.z = -this.w*this.d;
    backGroup.rotation.y =  Math.PI;
    this.sphere.add(backGroup)


    this.sphereInstance = [
      ...right.instances,
      ...left.instances,
      ...top.instances,
      ...bottom.instances,
      ...front.instances,
      ...back.instances,
    ]
  

    this.sphereInstance.forEach((e)=>{
      e.plane.updateWorldMatrix( true, false );

      e.plane.material = this.quadTreeconfig.config.material.clone();
      e.plane.material.colorNode = NODE.vec3(...hexToRgbA(getRandomColor()))
  
      var cnt_ = new THREE.Vector3(...this.quadTreeconfig.config.center)      
      e.plane.worldToLocal(cnt_)
      //----
      let radius = this.quadTreeconfig.config.radius
      let wp = new THREE.Vector3()
      project(wp,radius,cnt_)
      e.center = wp
      e.isRoot = true
      
      const g = new THREE.SphereGeometry( 1005, 5, 5 ); 
      var ma = new THREE.MeshBasicMaterial({color:'red'});
      let m  = new THREE.Mesh( g, ma );
      e.plane.add(m)
      m.position.copy( wp)
    })




 
   /* this.front = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.front.createDimensions('front')
    var front = new THREE.Group();
    front.add( ...this.front.instances.map(x=>x.plane) );

    this.back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.back.createDimensions('back')
    var back = new THREE.Group();
    back.add( ...this.back.instances.map(x=>x.plane) );
    back.position.z = -this.w*this.d;
    back.rotation.y =  Math.PI;

    this.right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.right.createDimensions('right')
    var right = new THREE.Group();
    right.add( ...this.right.instances.map(x=>x.plane) );
    right.position.z = -(this.w*this.d)/2;
    right.position.x =  (this.w*this.d)/2;
    right.rotation.y =  Math.PI/2;

    this.left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.left.createDimensions('left')
    var left = new THREE.Group();
    left.add( ...this.left.instances.map(x=>x.plane) );
    left.position.z =  -(this.w*this.d)/2;
    left.position.x =  -(this.w*this.d)/2;
    left.rotation.y =  -Math.PI/2;

    this.top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.top.createDimensions('top')
    var top = new THREE.Group();
    top.add( ...this.top.instances.map(x=>x.plane) );
    top.position.z = -(this.w*this.d)/2;
    top.position.y =  (this.w*this.d)/2;
    top.rotation.x = -Math.PI/2;

    this.bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.bottom.createDimensions('bottom')
    var bottom = new THREE.Group();
    bottom.add( ...this.bottom.instances.map(x=>x.plane) );
    bottom.position.z = -(this.w*this.d)/2;
    bottom.position.y = -(this.w*this.d)/2;
    bottom.rotation.x =  Math.PI/2;

    this.sphere.add(front);
    this.sphere.add(back);
    this.sphere.add(right);
    this.sphere.add(left);
    this.sphere.add(top);
    this.sphere.add(bottom);

    var cnt = this.centerPosition()

    this.sphereInstance = [
      ...this.front.instances,
      ...this.back.instances,
      ...this.right.instances,
      ...this.left.instances,
      ...this.top.instances,
      ...this.bottom.instances,
      ]

    this.sphereInstance.map((e)=>{
      var cnt_ = cnt.clone()      
      e.plane.worldToLocal(cnt_)
      var ps = THREEWG.float(radius).mul((THREEWG.positionLocal.sub(cnt_).normalize())).add(cnt_) 
      e.plane.material.positionNode = ps
      e.plane.material.colorNode    = color instanceof Function ? color() : color
      //----
      let wp = new THREE.Vector3()
      project(wp,radius,cnt_.clone())
      e.center = wp
      e.isRoot = true
      
      const g = new THREE.SphereGeometry( 105, 5, 5 ); 
      var ma = new THREE.MeshBasicMaterial({color:'blue'});
      let m  = new THREE.Mesh( g, ma );
      e.plane.add(m)
      m.position.copy( wp.clone())
      
    })
    

      this.front. quadTreeconfig.config['cnt'] = cnt.clone()
      this.back.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.right. quadTreeconfig.config['cnt'] = cnt.clone()
      this.left.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.top.   quadTreeconfig.config['cnt'] = cnt.clone()
      this.bottom.quadTreeconfig.config['cnt'] = cnt.clone()*/

    }

    metaData(){
      return this.quadTreeconfig.config
    }

    getAllInstance(){
      return this.sphereInstance
    }

    centerPosition() {
      this.bbox.expandByObject(this.sphere);
      var center = new THREE.Vector3();
      this.bbox.getCenter(center);
      return center
    }

    position(x,y,z){
      this.quadTreeconfig.config.position = {x,y,z}
      this.sphere.position.set(x,y,z)
      var bbox   = new THREE.Box3();
      bbox.expandByObject(this.sphere);
      var center = new THREE.Vector3();
      bbox.getCenter(center);
      var cnt = center
      let radius = this.quadTreeconfig.config.radius
      this.getAllInstance().forEach((e)=>{
        var cnt_ = cnt.clone()      
        e.plane.worldToLocal(cnt_)
        let wp = new THREE.Vector3()
        project(wp,radius,cnt_.clone())
        e.center = wp
      })
      this.front. quadTreeconfig.config['cnt'] = cnt.clone()
      this.back.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.right. quadTreeconfig.config['cnt'] = cnt.clone()
      this.left.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.top.   quadTreeconfig.config['cnt'] = cnt.clone()
      this.bottom.quadTreeconfig.config['cnt'] = cnt.clone()

    }

    scale(s){
      this.quadTreeconfig.config.scale = s
      this. sphere.scale.set(s,s,s)
      var bbox   = new THREE.Box3();
      bbox.expandByObject(this.sphere);
      var center = new THREE.Vector3();
      bbox.getCenter(center);
      var cnt = center
      let radius = this.quadTreeconfig.config.radius
      this.getAllInstance().forEach((e)=>{
        var cnt_ = cnt.clone()      
        e.plane.worldToLocal(cnt_)
        let wp = new THREE.Vector3()
        project(wp,radius,cnt_.clone())
        e.center = wp
      })
      this.front. quadTreeconfig.config['cnt'] = cnt.clone()
      this.back.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.right. quadTreeconfig.config['cnt'] = cnt.clone()
      this.left.  quadTreeconfig.config['cnt'] = cnt.clone()
      this.top.   quadTreeconfig.config['cnt'] = cnt.clone()
      this.bottom.quadTreeconfig.config['cnt'] = cnt.clone()
    }

    update(player){
      let quads = this.getAllInstance()
      for (var i = 0; i < quads.length; i++) {
          quads[i].update(player)
      } 
  }

}