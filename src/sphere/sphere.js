import * as NODE    from 'three/nodes';
import * as THREE   from 'three';
import {Quad}       from '../engine/quad.js'
import {QuadTrees}  from '../engine/quadtree.js'
import {project }   from './utils.js';
import { hexToRgbA,getRandomColor } from '../engine/utils.js';


export class Sphere{
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

    this.right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.right.quadTreeconfig.config = this.quadTreeconfig.config;    
    this.right.createDimensions('right')
    var rightGroup = new THREE.Group()
    rightGroup.position.z = -(this.w*this.d)/2;
    rightGroup.position.x =  (this.w*this.d)/2;
    rightGroup.rotation.y =  Math.PI/2;
    rightGroup.add( ...this.right.instances.map(x=>x.plane) );
    this.sphere.add(rightGroup)

    this.left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.left.quadTreeconfig.config = this.quadTreeconfig.config;
    this.left.createDimensions('left')
    var leftGroup = new THREE.Group();
    leftGroup.add( ...this.left.instances.map(x=>x.plane) );
    leftGroup.position.z =  -(this.w*this.d)/2;
    leftGroup.position.x =  -(this.w*this.d)/2;
    leftGroup.rotation.y =  -Math.PI/2;
    this.sphere.add(leftGroup)

    this.top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.top.quadTreeconfig.config = this.quadTreeconfig.config;
    this.top.createDimensions('top')
    var topGroup = new THREE.Group();
    topGroup.add( ...this.top.instances.map(x=>x.plane) );
    topGroup.position.z = -(this.w*this.d)/2;
    topGroup.position.y =  (this.w*this.d)/2;
    topGroup.rotation.x = -Math.PI/2;
    this.sphere.add(topGroup)

    this.bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.bottom.quadTreeconfig.config = this.quadTreeconfig.config;
    this.bottom.createDimensions('bottom')
    var bottomGroup = new THREE.Group();
    bottomGroup.add( ...this.bottom.instances.map(x=>x.plane) );
    bottomGroup.position.z = -(this.w*this.d)/2;
    bottomGroup.position.y = -(this.w*this.d)/2;
    bottomGroup.rotation.x =  Math.PI/2;
    this.sphere.add(bottomGroup)

    this.front  = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.front.quadTreeconfig.config = this.quadTreeconfig.config;
    this.front.createDimensions('front')
    let frontGroup = new THREE.Group()
    frontGroup.add(...this.front.instances.map(x=>x.plane))
    this.sphere.add(frontGroup)
    
    this.back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
    this.back.quadTreeconfig.config = this.quadTreeconfig.config;
    this.back.createDimensions('back')
    var backGroup = new THREE.Group();
    backGroup.add( ...this.back.instances.map(x=>x.plane) );
    backGroup.position.z = -this.w*this.d;
    backGroup.rotation.y =  Math.PI;
    this.sphere.add(backGroup)

    this.sphereInstance = [
      ...this.right.instances,
      ...this.left.instances,
      ...this.top.instances,
      ...this.bottom.instances,
      ...this.front.instances,
      ...this.back.instances,
    ]
  
    this.sphereInstance.forEach((e)=>{
      e.plane.updateWorldMatrix( true, false );

      e.plane.material = this.quadTreeconfig.config.material.clone();
      e.plane.material.colorNode = color instanceof Function ? color() : color
  
      var cnt_ = new THREE.Vector3(...this.quadTreeconfig.config.center)      
      e.plane.worldToLocal(cnt_)
      //----
      let radius = this.quadTreeconfig.config.radius
      let wp = new THREE.Vector3()
      project(wp,radius,cnt_)
      e.center = wp
      e.isRoot = true
      
      const g = new THREE.SphereGeometry( 1005, 5, 5 ); 
      var ma = new THREE.MeshBasicMaterial({color:'blue'});
      let m  = new THREE.Mesh( g, ma );
      e.plane.add(m)
      m.position.copy( wp)
    })
  }

  metaData(){
    return this.quadTreeconfig.config
  }

  getAllInstance(){
    return this.sphereInstance
  }

  position(x,y,z){
    this.quadTreeconfig.config.position = {x,y,z}
    this.sphere.position.set(x,y,z)
    this.quadTreeconfig.getCenter(x,y,z)
  }

  update(player){
    let quads = this.getAllInstance()
      for (var i = 0; i < quads.length; i++) {
        quads[i].update(player)
      } 
  }

}