import * as THREE  from 'three';
import * as TSL   from 'three/tsl';
import {norm,project}      from './utils.js'
import {frontsetData,backsetData,rightsetData,leftsetData,topsetData,bottomsetData} from  './quadTreeFunctions.js'
import { hexToRgbA,getRandomColor } from './utils.js';
function color(c){
  return (c instanceof Function ? c() : c)
}

class QuadTreeLoDCore  {
  constructor(config={}) {
    let shardedData = {
      maxLevelSize:1,
      minLevelSize:1,
      minPolyCount:1,
      maxPolyCount:undefined,
      dimensions:1,
      arrybuffers:{},
      shardedUniforms:{}, // TODO:
      dataTransfer:{
        front:  {textuers:[]},
        back:   {textuers:[]},
        right:  {textuers:[]},
        left:   {textuers:[]},
        top:    {textuers:[]},
        bottom: {textuers:[]},
      },
      position:{x:0,y:0,z:0},
      scale: 1,
      color: TSL.vec3(0,0,0),
      light:{},
      lodDistanceOffset: 1,
      material: new TSL.MeshBasicNodeMaterial({color:"grey"}),
      displacmentScale:1
    }
    this.config = Object.assign(shardedData, config)
  }


  levels(numOflvls) {
    var levelsArray  = [];
    var polyPerLevel = [];
    var value        = this.config.maxLevelSize
    var min          = this.config.minLevelSize
    var minPoly      = this.config.minPolyCount
    for (let i = 0; i < numOflvls; i++) {
        levelsArray .push( value   )
        polyPerLevel.push( minPoly )
        value   = Math.floor( value / 2   )
        minPoly = Math.floor( minPoly * 2 )
    }
    this.config['levels'] = {numOflvls,levelsArray,polyPerLevel}
    this.config['maxPolyCount'] = polyPerLevel[polyPerLevel.length - 1]
  }

  createArrayBuffers(){
    for ( var i = 0; i < this.config.levels.numOflvls;  i++ ) {
      const size     = this.config.levels.levelsArray [i]
      const poly     = this.config.levels.polyPerLevel[i]
      const geometry = new THREE.PlaneGeometry(size,size,poly,poly)
      this.config.arrybuffers[size] = {
        geometry:{
          parameters:         geometry.parameters,
          stringUv:           geometry.attributes.uv.array.toString(),
          stringPosition:     geometry.attributes.position.array.toString(),
          stringNormal:       geometry.attributes.normal  .array.toString(),
          byteLengthNormal:   geometry.attributes.position.array.byteLength,
          byteLengthPosition: geometry.attributes.position.array.byteLength,
        },
        idx:Array.from(geometry.index.array)
      }
    }
  }

  getCenter(x=0,y=0,z=0) {
    let wh = this.config.levels.levelsArray[0]
    let d = this.config.dimensions
    let g = new THREE.BoxGeometry( wh*d, wh*d, wh*d)
    let m = new THREE.MeshStandardMaterial();
    let box  = new THREE.Mesh( g, m );
    /*
        reset set the box z position
        I need the front face of the box to aline with the quad inital position if not the quad would be in the center of the box.
        Im able to get away with these because all sphere spawn from the center of the scene. So it dosent cause a prblem when initlizing the sphere.
    */
    box.position.set(x,y,(-wh*(d/2)) + z)
    var geometry = box.geometry;
    geometry.computeBoundingBox();
    var center = new THREE.Vector3();
    geometry.boundingBox.getCenter( center );
    box.localToWorld( center );
  
    this.config.center =[center.x,center.y,center.z]
  }


  static deleteShardedData() {
    const shardedDataKeys = Object.keys(QuadTreeLoDCore.shardedData);
    for (let i = 0; i < shardedDataKeys.length; i++) {
      delete QuadTreeLoDCore.shardedData[shardedDataKeys[i]];
    }
  }
}


 class QuadTreeLoD {

  constructor() {
    }

  update(player,quad){
    this.insert(player,quad)
    }

  setCenter(child,cnt){
    let wp = new THREE.Vector3()
    project(wp, child.quadTreeconfig.config.radius,cnt.clone())
    child.center = wp
   
    /*const g = new THREE.SphereGeometry( 505, 5, 5 ); 
    var ma = new THREE.MeshBasicMaterial({color:'blue'});
    let m  = new THREE.Mesh( g, ma );
    child.plane.add(m)
    m.position.copy( wp.clone())*/
    
  }  

  insert(player,quad){
    quad.active(true)
    let wpc = quad.center.clone()
    quad.plane.localToWorld(wpc)
    var distance = wpc.distanceTo(player.position)
   // console.log(distance)
    if ( (distance) < (quad.quadTreeconfig.config.lodDistanceOffset * quad.quadData.width) &&  quad.quadData.width > quad.quadTreeconfig.config.minLevelSize ){
      let childw         =  Math.floor(quad.quadData.width/2)
      let childh         =  Math.floor(quad.quadData.height/2)
      let widthSegments  =  quad.quadData.widthSegments*2
      let heightSegments =  quad.quadData.heightSegments*2
      let childList      =  this.createChildren( childw, childh, widthSegments, heightSegments, quad )
      for ( let i = 0; i < childList.length; i++ ){
        this.insert( player, childList[i] )
        }
      }
    }

  createChildren(w,h,rw,rh,quad){
    if (quad.children.length == 4){
     let isWebWorkerGeometry = quad.children.every( (val, i, arr) => val.plane.geometry.type === 'webWorkerGeometry' )
     if (isWebWorkerGeometry)
      quad.active(false)

      return quad.children
    }else{
      console.log(rw,rh)
      var side  = quad.side
      var idx   = quad.idx
      var textures =  (quad.quadTreeconfig.config.isTiles) ? quad.quadTreeconfig.config.dataTransfer[side][idx].textuers : quad.quadTreeconfig.config.dataTransfer[side].textuers
      var shardedGeometry = quad.quadTreeconfig.config.arrybuffers[w].geometry
      //---
      let dimensions = (quad.quadTreeconfig.config.isTiles) ? 1 : quad.quadTreeconfig.config.dimensions
      var starting   = quad.quadTreeconfig.config.maxLevelSize*dimensions
      var scaling    = w / starting
      var halfScale  = scaling/2
      //--- 
      var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
      var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
      var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
      var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
      //---    
      child1.plane.material.colorTSL = TSL.vec3(...hexToRgbA(getRandomColor()))
      child2.plane.material.colorTSL = TSL.vec3(...hexToRgbA(getRandomColor()))
      child3.plane.material.colorTSL = TSL.vec3(...hexToRgbA(getRandomColor()))
      child4.plane.material.colorTSL = TSL.vec3(...hexToRgbA(getRandomColor()))
      //---
      quad.add(child1);
      quad.add(child2);
      quad.add(child3);
      quad.add(child4);
      //---
      child1.side = side
      child2.side = side
      child3.side = side
      child4.side = side
      //---
      child1.idx = idx
      child2.idx = idx
      child3.idx = idx
      child4.idx = idx
      //---
      var cnt = new THREE.Vector3(...quad.quadTreeconfig.config.center)      
      child1.plane.worldToLocal(cnt)
      this.setCenter(child1,cnt)
      //---
      var cnt = new THREE.Vector3(...quad.quadTreeconfig.config.center)      
      child2.plane.worldToLocal(cnt)
      this.setCenter(child2,cnt)
      //---
      var cnt = new THREE.Vector3(...quad.quadTreeconfig.config.center)      
      child3.plane.worldToLocal(cnt)
      this.setCenter(child3,cnt)
      //---
      var cnt = new THREE.Vector3(...quad.quadTreeconfig.config.center)      
      child4.plane.worldToLocal(cnt)
      this.setCenter(child4,cnt)
      //---
      if (quad.side == 'front'){
        for (var i = 0; i < textures.length; i++) {
          frontsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          frontsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          frontsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          frontsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
        }
      }else if  (quad.side == 'back'){
        for (var i = 0; i < textures.length; i++) {
          backsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          backsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          backsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          backsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
        }
      }else if  (quad.side == 'right'){
        for (var i = 0; i < textures.length; i++) {
          rightsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          rightsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          rightsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          rightsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
        }
      }else if  (quad.side == 'left'){
        for (var i = 0; i < textures.length; i++) {
          leftsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          leftsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          leftsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          leftsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
        }
      }else if  (quad.side == 'top'){
        for (var i = 0; i < textures.length; i++) {
          topsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          topsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          topsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          topsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
        }
      }else if  (quad.side == 'bottom'){
        for (var i = 0; i < textures.length; i++) {
          bottomsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          bottomsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          bottomsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
          bottomsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],config:quad.quadTreeconfig.config})
        }
      }
    }
    return [child1,child2,child3,child4]
  }
}

export const QuadTrees = {QuadTreeLoD,QuadTreeLoDCore}