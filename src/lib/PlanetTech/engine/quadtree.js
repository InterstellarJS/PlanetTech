import * as THREE  from 'three';
import * as NODE   from 'three/nodes';
import {norm,project}      from './utils'
import {frontsetData,backsetData,rightsetData,leftsetData,topsetData,bottomsetData} from  './quadTreeFunctions'
import { hexToRgbA,getRandomColor } from './utils';
function color(c){
  return (c instanceof Function ? c() : c)
}

class QuadTreeLoDCore  {
  static shardedData = {
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
    color: NODE.vec3(0,0,0),
    light:{},
    lodDistanceOffset: 1,
    material: new NODE.MeshBasicNodeMaterial(),
    displacmentScale:1
  }

  constructor(config={}) {
    this.config = Object.assign(QuadTreeLoDCore.shardedData, config)
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
          stringPosition:     geometry.attributes.position.array.toString(),
          stringNormal:       geometry.attributes.normal  .array.toString(),
          byteLengthNormal:   geometry.attributes.position.array.byteLength,
          byteLengthPosition: geometry.attributes.position.array.byteLength,
        },
        idx:Array.from(geometry.index.array)
      }
    }
  }

  getCenter() {
    let wh = this.config.levels.levelsArray[0]
    let d = this.config.dimensions
    var g = new THREE.BoxGeometry( wh*d, wh*d, wh*d)
    var m = new THREE.MeshStandardMaterial();
    let box  = new THREE.Mesh( g, m );
    /*
        reset set the box z position
        I need the front face of the box to aline with the quad inital position if not the quad would be in the center of the box.
        Im able to get away with these because all sphere spawn from the center of the scene. So it dosent cause a prblem when initlizing the sphere.
    */
    box.position.z = -wh*(d/2) 
    let bbox   = new THREE.Box3()
    bbox.expandByObject(box);
    var center = new THREE.Vector3();
    bbox.getCenter(center);
    this.config.center =[center.x,center.y,center.z]
  }


  static deleteShardedData() {
    const shardedDataKeys = Object.keys(QuadTreeLoDCore.shardedData);
    for (let i = 0; i < shardedDataKeys.length; i++) {
      delete QuadTreeLoDCore.shardedData[shardedDataKeys[i]];
    }
  }
}


 class QuadTreeLoD extends QuadTreeLoDCore {

  constructor() {
    super()
    }

  update(player,quad){
    this.insert(player,quad)
    }

  setCenter(child,cnt){
    let wp = new THREE.Vector3()
    project(wp, this.config.radius,cnt.clone())
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
    if ( (distance) < (this.config.lodDistanceOffset * quad.quadData.width) &&  quad.quadData.width > this.config.minLevelSize ){
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
      //console.log(quad.children[1].plane.geometry)
      //let func = child1.initGeometry({position:quad.plane.position.toArray(),parentPositionVector:[0,0,0]})
     quad.active(false)

      if(quad.plane.geometry.type==='webWorkerGeometry'){
        //console.log('webWorkerGeometry ')

      }else if(quad.plane.geometry.type==='BufferGeometry'){
        //console.log('BufferGeometry ')
      }
      return quad.children
    }else{
      console.log(rw,rh)
      var side  = quad.side
      var idx   = quad.idx
      var cnt   = this.config.cnt
      var textures =  (this.config.isTiles) ? this.config.dataTransfer[side][idx].textuers : this.config.dataTransfer[side].textuers
      var shardedGeometry = this.config.arrybuffers[w].geometry
      //--- 
      var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
      var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
      var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
      var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
      //---    

      child1.plane.material.colorNode = NODE.vec3(...hexToRgbA(getRandomColor()))
      child2.plane.material.colorNode = NODE.vec3(...hexToRgbA(getRandomColor()))
      child3.plane.material.colorNode = NODE.vec3(...hexToRgbA(getRandomColor()))
      child4.plane.material.colorNode = NODE.vec3(...hexToRgbA(getRandomColor()))


      
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

      //---
      var cnt = new THREE.Vector3(...this.config.center)      
      child1.plane.worldToLocal(cnt)
      this.setCenter(child1,cnt)
      //---
      var cnt = new THREE.Vector3(...this.config.center)      
      child2.plane.worldToLocal(cnt)
      this.setCenter(child2,cnt)
      //---
      var cnt = new THREE.Vector3(...this.config.center)      
      child3.plane.worldToLocal(cnt)
      this.setCenter(child3,cnt)
      //---
      var cnt = new THREE.Vector3(...this.config.center)      
      child4.plane.worldToLocal(cnt)
      this.setCenter(child4,cnt)
      //---
      //console.log(child1.center,child2.center,child3.center,child4.center)

    }
    return [child1,child2,child3,child4]
  }
}

export const QuadTrees = {QuadTreeLoD,QuadTreeLoDCore}
