import * as THREE  from 'three';
import * as NODE   from 'three/nodes';
import {norm}      from './utils'
import {frontsetData,backsetData,rightsetData,leftsetData,topsetData,bottomsetData} from  './quadTreeFunctions'

function color(c){
  return (c instanceof Function ? c() : c)
}

class QuadTreeLoDCore  {
  static shardedData = {
    maxLevelSize:1,
    minLevelSize:1,
    minPolyCount:1,
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
    light:{}
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
  }

  createArrayBuffers(){
    for ( var i = 0; i < this.config.levels.numOflvls;  i++ ) {
      const size     = this.config.levels.levelsArray [i]
      const poly     = this.config.levels.polyPerLevel[i]
      const planeGeo = new THREE.PlaneGeometry(size,size,poly,poly)
      this.config.arrybuffers[size] = planeGeo
    }
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

  insert(player,quad){
    quad.active(true)
    const wp = new THREE.Vector3(0, 0, 0);
    quad.plane.getWorldPosition(wp)
    var distance = wp.distanceTo(player.position)/2
    if ( (distance) < (quad.quadData.width) &&  quad.quadData.width > this.config.minLevelSize ){
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


  
  front(w,h,rw,rh,quad){
    var side  = quad.side
    var cnt   = this.config.cnt
    var textures    = this.config.dataTransfer[side].textuers
    var shardedGeometry = this.config.arrybuffers[w] 
    var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
    var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
    var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
    var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
    quad.add(child1);
    quad.add(child2);
    quad.add(child3);
    quad.add(child4);
    child1.side = side
    child2.side = side
    child3.side = side
    child4.side = side
    var starting  = this.config.maxLevelSize*this.config.dimensions
    var scaling   = w / starting
    var halfScale = scaling/2

    var cnt = this.config.cnt.clone()
    child1.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child1.plane.material.colorNode == null ? (child1.plane.material.colorNode = color(this.config.color))  : (child1.plane.material.colorNode.add(child1.plane.material.colorNode)) 
    child1.plane.material.colorNode = currentColor
    child1.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child2.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child2.plane.material.colorNode == null ? (child2.plane.material.colorNode = color(this.config.color))  : (child2.plane.material.colorNode.add(child2.plane.material.colorNode))
    child2.plane.material.colorNode = currentColor
    child2.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child3.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child3.plane.material.colorNode == null ? (child3.plane.material.colorNode = color(this.config.color))  : (child3.plane.material.colorNode.add(child3.plane.material.colorNode))
    child3.plane.material.colorNode = currentColor
    child3.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child4.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child4.plane.material.colorNode == null ? (child4.plane.material.colorNode = color(this.config.color))  : (child4.plane.material.colorNode.add(child4.plane.material.colorNode))
    child4.plane.material.colorNode = currentColor
    child4.plane.material.positionNode = newP

    for (var i = 0; i < textures.length; i++) {
      frontsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      frontsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      frontsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      frontsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
    }

    return [child1,child2,child3,child4]
  }

  back(w,h,rw,rh,quad){
    var side  = quad.side
    var cnt   = this.config.cnt
    var textures    = this.config.dataTransfer[side].textuers
    var shardedGeometry = this.config.arrybuffers[w] 
    var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
    var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
    var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
    var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
    quad.add(child1);
    quad.add(child2);
    quad.add(child3);
    quad.add(child4);
    child1.side = side
    child2.side = side
    child3.side = side
    child4.side = side
    var starting  = this.config.maxLevelSize*this.config.dimensions
    var scaling   = w / starting
    var halfScale = scaling/2

    var cnt = this.config.cnt.clone()
    child1.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child1.plane.material.colorNode == null ? (child1.plane.material.colorNode = color(this.config.color))  : (child1.plane.material.colorNode.add(child1.plane.material.colorNode)) 
    child1.plane.material.colorNode = currentColor
    child1.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child2.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child2.plane.material.colorNode == null ? (child2.plane.material.colorNode = color(this.config.color))  : (child2.plane.material.colorNode.add(child2.plane.material.colorNode))
    child2.plane.material.colorNode = currentColor
    child2.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child3.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child3.plane.material.colorNode == null ? (child3.plane.material.colorNode = color(this.config.color))  : (child3.plane.material.colorNode.add(child3.plane.material.colorNode))
    child3.plane.material.colorNode = currentColor
    child3.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child4.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child4.plane.material.colorNode == null ? (child4.plane.material.colorNode = color(this.config.color))  : (child4.plane.material.colorNode.add(child4.plane.material.colorNode))
    child4.plane.material.colorNode = currentColor
    child4.plane.material.positionNode = newP

    for (var i = 0; i < textures.length; i++) {
      backsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      backsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      backsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      backsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
    }

    return [child1,child2,child3,child4]
  }

  right(w,h,rw,rh,quad){
    var side  = quad.side
    var cnt   = this.config.cnt
    var textures    = this.config.dataTransfer[side].textuers
    var shardedGeometry = this.config.arrybuffers[w] 
    var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
    var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
    var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
    var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
    quad.add(child1);
    quad.add(child2);
    quad.add(child3);
    quad.add(child4);
    child1.side = side
    child2.side = side
    child3.side = side
    child4.side = side
    var starting  = this.config.maxLevelSize*this.config.dimensions
    var scaling   = w / starting
    var halfScale = scaling/2

    var cnt = this.config.cnt.clone()
    child1.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child1.plane.material.colorNode == null ? (child1.plane.material.colorNode = color(this.config.color))  : (child1.plane.material.colorNode.add(child1.plane.material.colorNode)) 
    child1.plane.material.colorNode = currentColor
    child1.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child2.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child2.plane.material.colorNode == null ? (child2.plane.material.colorNode = color(this.config.color))  : (child2.plane.material.colorNode.add(child2.plane.material.colorNode))
    child2.plane.material.colorNode = currentColor
    child2.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child3.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child3.plane.material.colorNode == null ? (child3.plane.material.colorNode = color(this.config.color))  : (child3.plane.material.colorNode.add(child3.plane.material.colorNode))
    child3.plane.material.colorNode = currentColor
    child3.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child4.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child4.plane.material.colorNode == null ? (child4.plane.material.colorNode = color(this.config.color))  : (child4.plane.material.colorNode.add(child4.plane.material.colorNode))
    child4.plane.material.colorNode = currentColor
    child4.plane.material.positionNode = newP

    for (var i = 0; i < textures.length; i++) {
      rightsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      rightsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      rightsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      rightsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
    }

    return [child1,child2,child3,child4]
  }

  left(w,h,rw,rh,quad){
    var side  = quad.side
    var cnt   = this.config.cnt
    var textures    = this.config.dataTransfer[side].textuers
    var shardedGeometry = this.config.arrybuffers[w] 
    var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
    var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
    var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
    var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
    quad.add(child1);
    quad.add(child2);
    quad.add(child3);
    quad.add(child4);
    child1.side = side
    child2.side = side
    child3.side = side
    child4.side = side
    var starting  = this.config.maxLevelSize*this.config.dimensions
    var scaling   = w / starting
    var halfScale = scaling/2
    var cnt = this.config.cnt.clone()
    child1.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child1.plane.material.colorNode == null ? (child1.plane.material.colorNode = color(this.config.color))  : (child1.plane.material.colorNode.add(child1.plane.material.colorNode)) 
    child1.plane.material.colorNode = currentColor
    child1.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child2.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child2.plane.material.colorNode == null ? (child2.plane.material.colorNode = color(this.config.color))  : (child2.plane.material.colorNode.add(child2.plane.material.colorNode))
    child2.plane.material.colorNode = currentColor
    child2.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child3.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child3.plane.material.colorNode == null ? (child3.plane.material.colorNode = color(this.config.color))  : (child3.plane.material.colorNode.add(child3.plane.material.colorNode))
    child3.plane.material.colorNode = currentColor
    child3.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child4.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child4.plane.material.colorNode == null ? (child4.plane.material.colorNode = color(this.config.color))  : (child4.plane.material.colorNode.add(child4.plane.material.colorNode))
    child4.plane.material.colorNode = currentColor
    child4.plane.material.positionNode = newP

    for (var i = 0; i < textures.length; i++) {
      leftsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      leftsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      leftsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      leftsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
    }

    return [child1,child2,child3,child4]
  }
  
  top(w,h,rw,rh,quad){
    var side  = quad.side
    var cnt   = this.config.cnt
    var textures    = this.config.dataTransfer[side].textuers
    var shardedGeometry = this.config.arrybuffers[w] 
    var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
    var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
    var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
    var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
    quad.add(child1);
    quad.add(child2);
    quad.add(child3);
    quad.add(child4);
    child1.side = side
    child2.side = side
    child3.side = side
    child4.side = side
    var starting  = this.config.maxLevelSize*this.config.dimensions
    var scaling   = w / starting
    var halfScale = scaling/2
    var cnt = this.config.cnt.clone()
    child1.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child1.plane.material.colorNode == null ? (child1.plane.material.colorNode = color(this.config.color))  : (child1.plane.material.colorNode.add(child1.plane.material.colorNode)) 
    child1.plane.material.colorNode = currentColor
    child1.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child2.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child2.plane.material.colorNode == null ? (child2.plane.material.colorNode = color(this.config.color))  : (child2.plane.material.colorNode.add(child2.plane.material.colorNode))
    child2.plane.material.colorNode = currentColor
    child2.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child3.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child3.plane.material.colorNode == null ? (child3.plane.material.colorNode = color(this.config.color))  : (child3.plane.material.colorNode.add(child3.plane.material.colorNode))
    child3.plane.material.colorNode = currentColor
    child3.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child4.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child4.plane.material.colorNode == null ? (child4.plane.material.colorNode = color(this.config.color))  : (child4.plane.material.colorNode.add(child4.plane.material.colorNode))
    child4.plane.material.colorNode = currentColor
    child4.plane.material.positionNode = newP
    for (var i = 0; i < textures.length; i++) {
      topsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      topsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      topsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      topsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
    }
    return [child1,child2,child3,child4]
  }

  bottom(w,h,rw,rh,quad){
    var side  = quad.side
    var cnt   = this.config.cnt
    var textures    = this.config.dataTransfer[side].textuers
    var shardedGeometry = this.config.arrybuffers[w] 
    var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
    var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
    var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
    var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')
    quad.add(child1);
    quad.add(child2);
    quad.add(child3);
    quad.add(child4);
    child1.side = side
    child2.side = side
    child3.side = side
    child4.side = side
    var starting  = this.config.maxLevelSize*this.config.dimensions
    var scaling   = w / starting
    var halfScale = scaling/2

    var cnt = this.config.cnt.clone()
    child1.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child1.plane.material.colorNode == null ? (child1.plane.material.colorNode = color(this.config.color))  : (child1.plane.material.colorNode.add(child1.plane.material.colorNode)) 
    child1.plane.material.colorNode = currentColor
    child1.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child2.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child2.plane.material.colorNode == null ? (child2.plane.material.colorNode = color(this.config.color))  : (child2.plane.material.colorNode.add(child2.plane.material.colorNode))
    child2.plane.material.colorNode = currentColor
    child2.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child3.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child3.plane.material.colorNode == null ? (child3.plane.material.colorNode = color(this.config.color))  : (child3.plane.material.colorNode.add(child3.plane.material.colorNode))
    child3.plane.material.colorNode = currentColor
    child3.plane.material.positionNode = newP
    var cnt = this.config.cnt.clone()
    child4.plane.worldToLocal(cnt)
    var newP = NODE.float(this.config.radius).mul((NODE.positionLocal.sub(cnt).normalize())).add(cnt)
    var currentColor = child4.plane.material.colorNode == null ? (child4.plane.material.colorNode = color(this.config.color))  : (child4.plane.material.colorNode.add(child4.plane.material.colorNode))
    child4.plane.material.colorNode = currentColor
    child4.plane.material.positionNode = newP

    for (var i = 0; i < textures.length; i++) {
      bottomsetData({child:child1,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      bottomsetData({child:child2,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      bottomsetData({child:child3,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
      bottomsetData({child:child4,starting:starting,scaling:scaling,halfScale:halfScale,texture:textures[i],cnt:this.config.cnt.clone(),config:this.config})
    }


    return [child1,child2,child3,child4]
  }

  createChildren(w,h,rw,rh,quad){
    if (quad.children.length == 4){
      quad.active(false)
      return quad.children
    }else{
      if (quad.side == 'front'){
        return this.front(w,h,rw,rh,quad)
      }else if  (quad.side == 'back'){
        return this.back(w,h,rw,rh,quad)
      }else if  (quad.side == 'right'){
        return this.right(w,h,rw,rh,quad)
      }else if  (quad.side == 'left'){
        return this.left(w,h,rw,rh,quad)
      }else if  (quad.side == 'top'){
        return this.top(w,h,rw,rh,quad)
      }else if  (quad.side == 'bottom'){
        return this.bottom(w,h,rw,rh,quad)
      }



    }
  }
}









export const QuadTrees = {QuadTreeLoD,QuadTreeLoDCore}
