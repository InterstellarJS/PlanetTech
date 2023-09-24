import * as THREEWG from 'three/nodes';
import * as THREE   from 'three';
import Quad         from '../engine/quad'
import {QuadTrees}  from '../engine/quadtree'



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
        this.quadTreeconfig.shardedData.color = color
        this.quadTreeconfig.shardedData.displacmentScale = displacmentScale


        this.front = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.front.createQuadTree(lvl)
        this.front.createDimensions('front')
        var front = new THREE.Group();
        front.add( ...this.front.instances.map(x=>x.plane) );

        this.back = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.back.createQuadTree(lvl)
        this.back.createDimensions('back')
        var back = new THREE.Group();
        back.add( ...this.back.instances.map(x=>x.plane) );
        back.position.z = -this.w*this.d;
        back.rotation.y =  Math.PI;

        this.right = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.right.createQuadTree(lvl)
        this.right.createDimensions('right')
        var right = new THREE.Group();
        right.add( ...this.right.instances.map(x=>x.plane) );
        right.position.z = -(this.w*this.d)/2;
        right.position.x =  (this.w*this.d)/2;
        right.rotation.y =  Math.PI/2;

        this.left = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.left.createQuadTree(lvl)
        this.left.createDimensions('left')
        var left = new THREE.Group();
        left.add( ...this.left.instances.map(x=>x.plane) );
        left.position.z =  -(this.w*this.d)/2;
        left.position.x =  -(this.w*this.d)/2;
        left.rotation.y =  -Math.PI/2;

        this.top = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.top.createQuadTree(lvl)
        this.top.createDimensions('top')
        var top = new THREE.Group();
        top.add( ...this.top.instances.map(x=>x.plane) );
        top.position.z = -(this.w*this.d)/2;
        top.position.y =  (this.w*this.d)/2;
        top.rotation.x = -Math.PI/2;

        this.bottom = new Quad(this.w,this.h,this.ws,this.hs,this.d)
        this.bottom.createQuadTree(lvl)
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
    
        let allp = [
            ...front.children,
            ...back.children,
            ...right.children,
            ...left.children,
            ...top.children,
            ...bottom.children,
          ]

          allp.map((e)=>{
            var cnt_ = cnt.clone()      
            e.worldToLocal(cnt_)
            var ps = THREEWG.float(radius).mul((THREEWG.positionLocal.sub(cnt_).normalize())).add(cnt_) 
            e.material.positionNode = ps
            e.material.colorNode    = color instanceof Function ? color() : color
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