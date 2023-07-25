import * as THREE          from 'three';
import {norm}              from './utils'
import * as THREEWG from 'three/nodes';
import {
  snoise3D,fbmNoise,displacementNormalNoise,light,patternNoise,displacementNormalNoiseFBM,displacementDomainWarping
} from  './../shaders/glslFunctions'



class QuadTreeLoDCore  {
  static shardedData = {
    maxLevelSize:1,
    minLevelSize:1,
    minPolyCount:1,
    dimensions:1,
    arrybuffers:{},
    shardedUniforms:{} // TODO:
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
    var distance = wp.distanceTo(player.position)
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

  createChildren(w,h,rw,rh,quad){
    if (quad.children.length == 4){
      quad.active(false)
      return quad.children
    }else{

      console.log('---------')
      var textures   = this.config.dataTransfer.textures
      var shardedGeometry = this.config.arrybuffers[w]

      var child1  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NW')
      var child2  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'NE')
      var child3  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SE')
      var child4  = quad.createNewMesh(shardedGeometry).setPosition([w,h,rw,rh],'SW')


      quad.add(child1);
      quad.add(child2);
      quad.add(child3);
      quad.add(child4);

      var lighting = THREEWG.func(`
      vec3 light_(vec3 n, vec3 ld ) {
        return light( n,ld);
      }
      `,[light])

      for (var i = 0; i < textures.length; i++) {
        var starting  = this.config.maxLevelSize*this.config.dimensions
        var scaling   = w / starting
        var halfScale = scaling/2

        var wp = new THREE.Vector3();
        child1.plane.localToWorld(wp)
        var nxj = norm(wp.x,Math.abs(starting/2),-Math.abs(starting/2))
        var nyj = norm(wp.y,Math.abs(starting/2),-Math.abs(starting/2))
        var offSets = THREEWG.vec2(nxj-halfScale,nyj-halfScale)
        var newUV = THREEWG.uv().mul(scaling).add(offSets)
        var textureNode = THREEWG.texture( textures[i],newUV)
        var p = child1.plane
        if(p.material.colorNode){
          //const displace = THREEWG.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
          //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
          //p.material.positionNode =  THREEWG.positionLocal.add( displace );
        }else{
          const displace = textureNode.r.mul(15.0).mul(THREEWG.normalLocal)
          p.material.colorNode = textureNode
          //p.material.colorNode = lighting.call({n:p.material.colorNode,ld:THREEWG.vec3(0,0,0)})
          p.material.positionNode = THREEWG.positionLocal.add( displace );

        }
        
        var wp = new THREE.Vector3();
        child2.plane.localToWorld(wp)
        var nxj = norm(wp.x,Math.abs(starting/2),-Math.abs(starting/2))
        var nyj = norm(wp.y,Math.abs(starting/2),-Math.abs(starting/2))
        var offSets = THREEWG.vec2(nxj-halfScale,nyj-halfScale)
        var newUV   = THREEWG.uv().mul(scaling).add(offSets)
        var textureNode = THREEWG.texture( textures[i],newUV)
        var p = child2.plane
        if(p.material.colorNode){
          //const displace = THREEWG.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
          //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
          //p.material.positionNode =  THREEWG.positionLocal.add( displace );
        }else{
          const displace = textureNode.r.mul(15.0).mul(THREEWG.normalLocal)
          p.material.colorNode = textureNode
          //p.material.colorNode = lighting.call({n:p.material.colorNode,ld:THREEWG.vec3(0,0,0)})
          p.material.positionNode = THREEWG.positionLocal.add( displace );
        }

        var wp = new THREE.Vector3();
        child3.plane.localToWorld(wp)
        var nxj = norm(wp.x,Math.abs(starting/2),-Math.abs(starting/2))
        var nyj = norm(wp.y,Math.abs(starting/2),-Math.abs(starting/2))
        var offSets = THREEWG.vec2(nxj-halfScale,nyj-halfScale)
        var newUV = THREEWG.uv().mul(scaling).add(offSets)
        var textureNode = THREEWG.texture( textures[i],newUV)
        var p = child3.plane
        if(p.material.colorNode){
          //const displace = THREEWG.normalLocal.mul( p.material.positionNode.add(textureNode.x.mul(5)) );
          //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
          //p.material.positionNode =  THREEWG.positionLocal.add( displace );
        }else{
          const displace = textureNode.r.mul(15.0).mul(THREEWG.normalLocal)
          p.material.colorNode = textureNode
          //p.material.colorNode = lighting.call({n:p.material.colorNode,ld:THREEWG.vec3(0,0,0)})
          p.material.positionNode = THREEWG.positionLocal.add( displace );
        }

        var wp = new THREE.Vector3();
        child4.plane.localToWorld(wp)
        var nxj = norm(wp.x,Math.abs(starting/2),-Math.abs(starting/2))
        var nyj = norm(wp.y,Math.abs(starting/2),-Math.abs(starting/2))
        var offSets = THREEWG.vec2(nxj-halfScale,nyj-halfScale)
        var newUV = THREEWG.uv().mul(scaling).add(offSets)
        var textureNode = THREEWG.texture( textures[i],newUV)
        var p = child4.plane
        if(p.material.positionNode){
          //const displace = textureNode.x.mul(5).mul(THREEWG.normalLocal)
          //p.material.colorNode = p.material.colorNode.add(lighting(displacedNormal(textureNode,newUV)))
          //p.material.positionNode = p.material.positionNode.add( displace );
        }else{
          const displace = textureNode.r.mul(15.0).mul(THREEWG.normalLocal)
          p.material.colorNode = textureNode
          //p.material.colorNode = lighting.call({n:p.material.colorNode,ld:THREEWG.vec3(0,0,0)})
          p.material.positionNode = THREEWG.positionLocal.add( displace );
        }
      }


      return [child1,child2,child3,child4]
    }
  }
}









export const QuadTrees = {QuadTreeLoD,QuadTreeLoDCore}
